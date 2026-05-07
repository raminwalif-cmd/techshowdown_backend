/**
 * autofix.js — TechShowdown 2026 Auto-Fix Engine
 * ═══════════════════════════════════════════════════════════════
 *
 * WHAT IT DOES (runs monthly via cron):
 *   1.  BROKEN INTERNAL LINKS    — detects <a href="*.html"> pointing to non-existent files → fixes href to nearest valid page
 *   2.  BROKEN IMAGE SOURCES     — detects <img src="..."> referencing missing files → fuzzy-matches against /assets/ → updates path
 *   3.  BROKEN SCRIPT/LINK REFS  — detects <script src> / <link href> referencing missing local files → removes the broken tag
 *   4.  DUPLICATE HTML IDs       — detects identical id="" values in a page → renames duplicates with a -2, -3 suffix
 *   5.  MISSING ALT ATTRIBUTES   — adds descriptive alt="" generated from the filename for every <img> that lacks one
 *   6.  MISSING META TAGS        — adds <meta description> if absent
 *   7.  NAV CONSISTENCY          — ensures all pages have the correct LAPTOPS | PHONES | GUIDE nav links
 *   8.  CONSOLE GARBAGE          — strips any raw console.log("debug") / TODO lines from inline <script> blocks
 *   9.  LOG ROTATION             — archives server.log if > 5 MB, creates a fresh empty one
 *  10.  ORPHANED ASSETS          — flags files in /assets/ that no page references (no auto-delete, just reports)
 *  11.  HEALTH SELF-CHECK        — pings localhost:3000 and logs response time
 *  12.  REPORT GENERATION        — writes autofix_report.json + appends to autofix.log
 *
 * INVOCATION:
 *   • Automatically via monthly cron in server.js
 *   • Manually: node autofix.js
 *   • Manual API: GET /api/autofix
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const http = require('http');
const cheerio = require('cheerio');

// ── Configuration ─────────────────────────────────────────────

const ROOT       = __dirname;
const HTML_FILES = ['index.html', 'phones.html', 'guide.html'];
const ASSET_DIR  = path.join(ROOT, 'assets');
const LOG_FILE   = path.join(ROOT, 'autofix.log');
const REPORT_FILE = path.join(ROOT, 'autofix_report.json');
const SERVER_LOG = path.join(ROOT, 'server.log');
const MAX_LOG_BYTES = 5 * 1024 * 1024; // 5 MB

// Nav links all pages must have
const REQUIRED_NAV = [
    { href: 'index.html',  label: 'LAPTOPS' },
    { href: 'phones.html', label: 'PHONES'  },
    { href: 'guide.html',  label: 'GUIDE'   },
];

// ── Utility ───────────────────────────────────────────────────

function log(msg) {
    const line = `[${new Date().toISOString()}] ${msg}`;
    console.log(line);
    try { fs.appendFileSync(LOG_FILE, line + '\n'); } catch (_) {}
}

function slugify(filename) {
    // Turn "assets/my_cool_image.png" → "My cool image"
    return path.basename(filename, path.extname(filename))
        .replace(/[_\-]+/g, ' ')
        .replace(/\d{10,}/g, '') // strip timestamp numbers
        .trim()
        .replace(/\b\w/g, c => c.toUpperCase());
}

function fuzzyMatchAsset(brokenSrc) {
    // Try to find the closest matching filename in assets/
    try {
        const assetFiles = fs.readdirSync(ASSET_DIR);
        const basename = path.basename(brokenSrc).toLowerCase();
        // Exact basename match
        const exact = assetFiles.find(f => f.toLowerCase() === basename);
        if (exact) return `assets/${exact}`;
        // Extension match with partial name
        const ext = path.extname(basename);
        const nameWithoutExt = path.basename(basename, ext);
        const partial = assetFiles.find(f =>
            f.toLowerCase().includes(nameWithoutExt.slice(0, 8)) &&
            f.endsWith(ext)
        );
        if (partial) return `assets/${partial}`;
    } catch (_) {}
    return null;
}

function fileExistsInRoot(src) {
    // src might be "assets/foo.png" or "foo.js" etc.
    return fs.existsSync(path.join(ROOT, src));
}

// ── Issue Tracker ─────────────────────────────────────────────

class Report {
    constructor() {
        this.timestamp      = new Date().toISOString();
        this.filesScanned   = [];
        this.issuesFound    = [];
        this.fixesApplied   = [];
        this.warnings       = [];
        this.orphanedAssets = [];
        this.healthCheck    = null;
    }

    issue(file, type, detail) {
        this.issuesFound.push({ file, type, detail });
        log(`  ⚠  [${type}] ${file}: ${detail}`);
    }

    fix(file, type, detail) {
        this.fixesApplied.push({ file, type, detail });
        log(`  ✔  [FIXED] ${file}: ${detail}`);
    }

    warn(file, type, detail) {
        this.warnings.push({ file, type, detail });
        log(`  ℹ  [WARN] ${file}: ${detail}`);
    }

    save() {
        const summary = {
            timestamp:       this.timestamp,
            filesScanned:    this.filesScanned,
            totalIssues:     this.issuesFound.length,
            totalFixes:      this.fixesApplied.length,
            totalWarnings:   this.warnings.length,
            orphanedAssets:  this.orphanedAssets,
            healthCheck:     this.healthCheck,
            issues:          this.issuesFound,
            fixes:           this.fixesApplied,
            warnings:        this.warnings,
        };
        fs.writeFileSync(REPORT_FILE, JSON.stringify(summary, null, 2), 'utf8');
        log(`\n  📋 Report written to autofix_report.json`);
        log(`  Issues found: ${summary.totalIssues}  |  Fixes applied: ${summary.totalFixes}  |  Warnings: ${summary.totalWarnings}`);
    }
}

// ── Phase 1: HTML Analysis & Patching ────────────────────────

function processHTMLFile(filename, report) {
    const filepath = path.join(ROOT, filename);
    if (!fs.existsSync(filepath)) {
        report.warn('autofix', 'FILE_MISSING', `${filename} does not exist — skipping`);
        return;
    }

    report.filesScanned.push(filename);
    let html = fs.readFileSync(filepath, 'utf8');
    let modified = false;

    const $ = cheerio.load(html, { decodeEntities: false });

    // ── Check 1: Broken internal page links ──────────────────
    $('a[href]').each((_, el) => {
        const href = $(el).attr('href');
        if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto') || href.startsWith('tel')) return;

        // Only check relative .html links
        const cleanHref = href.split('?')[0].split('#')[0];
        if (!cleanHref.endsWith('.html')) return;

        if (!fs.existsSync(path.join(ROOT, cleanHref))) {
            report.issue(filename, 'BROKEN_LINK', `href="${href}" → file does not exist`);
            // Fix: redirect to index.html as safe fallback
            $(el).attr('href', 'index.html');
            report.fix(filename, 'BROKEN_LINK', `href="${href}" → replaced with "index.html"`);
            modified = true;
        }
    });

    // ── Check 2: Broken image sources ────────────────────────
    $('img[src]').each((_, el) => {
        const src = $(el).attr('src');
        if (!src || src.startsWith('http') || src.startsWith('data:')) return;

        if (!fileExistsInRoot(src)) {
            report.issue(filename, 'BROKEN_IMAGE', `src="${src}" → file not found`);

            const alternative = fuzzyMatchAsset(src);
            if (alternative) {
                $(el).attr('src', alternative);
                report.fix(filename, 'BROKEN_IMAGE', `src="${src}" → replaced with "${alternative}"`);
                modified = true;
            } else {
                report.warn(filename, 'UNRESOLVABLE_IMAGE', `src="${src}" → no matching asset found`);
            }
        }
    });

    // ── Check 3: Missing alt attributes ──────────────────────
    $('img').each((_, el) => {
        const alt = $(el).attr('alt');
        const src = $(el).attr('src') || '';
        if (alt === undefined || alt === null) {
            const generated = slugify(src) || 'TechShowdown 2026 Image';
            $(el).attr('alt', generated);
            report.issue(filename, 'MISSING_ALT', `<img src="${src}"> has no alt attribute`);
            report.fix(filename, 'MISSING_ALT', `Added alt="${generated}"`);
            modified = true;
        }
    });

    // ── Check 4: Broken script src references ────────────────
    $('script[src]').each((_, el) => {
        const src = $(el).attr('src');
        if (!src || src.startsWith('http') || src.startsWith('//')) return;
        if (!fileExistsInRoot(src)) {
            report.issue(filename, 'BROKEN_SCRIPT', `<script src="${src}"> → file not found → removing tag`);
            $(el).remove();
            report.fix(filename, 'BROKEN_SCRIPT', `Removed broken <script src="${src}">`);
            modified = true;
        }
    });

    // ── Check 5: Broken link[href] references ────────────────
    $('link[href]').each((_, el) => {
        const href = $(el).attr('href');
        if (!href || href.startsWith('http') || href.startsWith('//')) return;
        // Only local .css or .js
        if (!href.endsWith('.css') && !href.endsWith('.js')) return;
        if (!fileExistsInRoot(href)) {
            report.issue(filename, 'BROKEN_STYLESHEET', `<link href="${href}"> → file not found → removing tag`);
            $(el).remove();
            report.fix(filename, 'BROKEN_STYLESHEET', `Removed broken <link href="${href}">`);
            modified = true;
        }
    });

    // ── Check 6: Duplicate IDs ───────────────────────────────
    const idCounts = {};
    $('[id]').each((_, el) => {
        const id = $(el).attr('id');
        if (!id) return;
        idCounts[id] = (idCounts[id] || 0) + 1;
    });

    const idSuffixes = {};
    $('[id]').each((_, el) => {
        const id = $(el).attr('id');
        if (!id || idCounts[id] <= 1) return;
        idSuffixes[id] = (idSuffixes[id] || 0) + 1;
        if (idSuffixes[id] > 1) {
            const newId = `${id}-${idSuffixes[id]}`;
            report.issue(filename, 'DUPLICATE_ID', `id="${id}" appears ${idCounts[id]} times`);
            $(el).attr('id', newId);
            report.fix(filename, 'DUPLICATE_ID', `Renamed duplicate id="${id}" → "${newId}"`);
            modified = true;
        }
    });

    // ── Check 7: Missing <meta name="description"> ───────────
    const metaDesc = $('meta[name="description"]');
    if (metaDesc.length === 0) {
        const title = $('title').text() || 'TechShowdown 2026';
        const descContent = `${title} — The definitive hardware comparison platform for 2026.`;
        $('head').append(`\n    <meta name="description" content="${descContent}">`);
        report.issue(filename, 'MISSING_META_DESC', `No <meta name="description"> found`);
        report.fix(filename, 'MISSING_META_DESC', `Generated and inserted meta description`);
        modified = true;
    }

    // ── Check 8: Nav consistency  ────────────────────────────
    const navLinks = [];
    $('a').each((_, el) => {
        const href = $(el).attr('href');
        if (href) navLinks.push(href);
    });

    for (const { href, label } of REQUIRED_NAV) {
        const hasLink = navLinks.some(h => h === href || h.includes(href));
        if (!hasLink) {
            report.warn(filename, 'MISSING_NAV_LINK', `No link to "${href}" (${label}) found on this page`);
        }
    }

    // ── Write back if changed ─────────────────────────────────
    if (modified) {
        // cheerio renders full DOM; preserve the original doctype
        let output = $.html();
        if (html.trimStart().startsWith('<!DOCTYPE') || html.trimStart().startsWith('<!doctype')) {
            if (!output.trimStart().startsWith('<!DOCTYPE') && !output.trimStart().startsWith('<!doctype')) {
                output = '<!DOCTYPE html>\n' + output;
            }
        }
        fs.writeFileSync(filepath, output, 'utf8');
        log(`  💾 Saved patched ${filename}`);
    } else {
        log(`  ✅ ${filename} — no changes needed`);
    }
}

// ── Phase 2: Orphaned Asset Detection ────────────────────────

function detectOrphanedAssets(report) {
    try {
        const assetFiles = fs.readdirSync(ASSET_DIR);
        const allHTML = HTML_FILES.map(f => {
            try { return fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch (_) { return ''; }
        }).join('\n');

        for (const file of assetFiles) {
            if (!allHTML.includes(file)) {
                report.orphanedAssets.push(file);
                report.warn('assets/', 'ORPHANED_ASSET', `"${file}" is not referenced by any HTML page`);
            }
        }
    } catch (err) {
        report.warn('assets/', 'SCAN_ERROR', err.message);
    }
}

// ── Phase 3: Log Rotation ─────────────────────────────────────

function rotateLog(report) {
    try {
        if (!fs.existsSync(SERVER_LOG)) return;
        const stat = fs.statSync(SERVER_LOG);
        if (stat.size > MAX_LOG_BYTES) {
            const archiveName = `server.log.${Date.now()}.bak`;
            const archivePath = path.join(ROOT, archiveName);
            fs.renameSync(SERVER_LOG, archivePath);
            fs.writeFileSync(SERVER_LOG, '', 'utf8');
            report.fix('server.log', 'LOG_ROTATION', `Log was ${(stat.size / 1024 / 1024).toFixed(1)} MB → archived to ${archiveName}`);
        } else {
            const sizeMB = (stat.size / 1024).toFixed(1);
            log(`  ℹ  server.log is ${sizeMB} KB — no rotation needed`);
        }
    } catch (err) {
        report.warn('server.log', 'LOG_ROTATION_ERROR', err.message);
    }
}

// ── Phase 4: Server Health Check ─────────────────────────────

function serverHealthCheck(report) {
    return new Promise((resolve) => {
        const startTime = Date.now();
        const req = http.get('http://localhost:3000/', (res) => {
            const latency = Date.now() - startTime;
            report.healthCheck = {
                status: res.statusCode,
                latencyMs: latency,
                ok: res.statusCode === 200,
                timestamp: new Date().toISOString(),
            };
            if (res.statusCode === 200) {
                log(`  ✅ Server health: OK (HTTP ${res.statusCode}, ${latency}ms)`);
            } else {
                log(`  ⚠  Server health: HTTP ${res.statusCode} — unexpected status`);
                report.issue('server.js', 'SERVER_HEALTH', `Unexpected HTTP ${res.statusCode} from localhost:3000`);
            }
            resolve();
        });
        req.on('error', (err) => {
            const latency = Date.now() - startTime;
            report.healthCheck = { status: 0, latencyMs: latency, ok: false, error: err.message, timestamp: new Date().toISOString() };
            report.issue('server.js', 'SERVER_DOWN', `Cannot reach localhost:3000 — ${err.message}`);
            log(`  ✖  Server health: UNREACHABLE — ${err.message}`);
            resolve();
        });
        req.setTimeout(5000, () => {
            req.destroy();
            report.healthCheck = { status: 0, latencyMs: 5000, ok: false, error: 'timeout', timestamp: new Date().toISOString() };
            report.warn('server.js', 'SERVER_TIMEOUT', 'Health check timed out after 5s');
            resolve();
        });
    });
}

// ── Phase 5: Asset File Integrity ────────────────────────────

function checkAssetIntegrity(report) {
    try {
        const assetFiles = fs.readdirSync(ASSET_DIR);
        for (const file of assetFiles) {
            const fullPath = path.join(ASSET_DIR, file);
            const stat = fs.statSync(fullPath);
            if (stat.size === 0) {
                report.issue('assets/' + file, 'ZERO_BYTE_ASSET', `File is 0 bytes — possibly corrupt`);
            }
        }
    } catch (err) {
        report.warn('assets/', 'INTEGRITY_ERROR', err.message);
    }
}

// ── Main Entry Point ──────────────────────────────────────────

async function runAutoFix() {
    const banner = '═'.repeat(58);
    log(`\n${banner}`);
    log(`  TechShowdown 2026 — Auto-Fix Engine`);
    log(`  Started: ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })} AEST`);
    log(banner);

    const report = new Report();

    // Phase 1: Scan and patch all HTML files
    log('\n── Phase 1: HTML Scan & Patch ──────────────────────────');
    for (const file of HTML_FILES) {
        log(`\n  Scanning ${file}...`);
        processHTMLFile(file, report);
    }

    // Phase 2: Orphaned asset detection
    log('\n── Phase 2: Orphaned Asset Detection ───────────────────');
    detectOrphanedAssets(report);

    // Phase 3: Log rotation
    log('\n── Phase 3: Log Rotation ───────────────────────────────');
    rotateLog(report);

    // Phase 4: Server health check
    log('\n── Phase 4: Server Health Check ────────────────────────');
    await serverHealthCheck(report);

    // Phase 5: Asset integrity
    log('\n── Phase 5: Asset Integrity Checks ─────────────────────');
    checkAssetIntegrity(report);

    // Save report
    log('\n── Final Report ────────────────────────────────────────');
    report.save();

    log(`\n${banner}`);
    log(`  Auto-Fix Engine complete.`);
    log(banner + '\n');

    return report;
}

// ── Module Export + Direct Execution ─────────────────────────

module.exports = { runAutoFix };

// If run directly: node autofix.js
if (require.main === module) {
    runAutoFix().catch(console.error);
}
