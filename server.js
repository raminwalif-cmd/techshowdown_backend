/**
 * server.js — TechShowdown 2026 Price Sentinel Server
 * 
 * Features:
 *   1. Alert Registration API  — stores alerts persistently in JSON
 *   2. Daily Price Scanner     — cron-scheduled Puppeteer scraping of AU retailers
 *   3. Smart Notifications     — emails ONLY on price changes or deal detection
 *   4. Manual Scan Trigger     — GET /api/scan-now for testing
 *   5. Alert Status API        — GET /api/alerts for debugging
 *   6. Auto-Fix Engine         — monthly scan & repair of HTML, assets, and logs
 *   7. Manual Auto-Fix Trigger — GET /api/autofix
 * 
 * IMPORTANT: Users are NEVER emailed if prices remain unchanged.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path');
const nodemailer = require('nodemailer');

const alertStore    = require('./alertStore');
const priceScanner  = require('./priceScanner');
const pdfGenerator  = require('./pdfGenerator');
const { runAutoFix } = require('./autofix');

const app = express();
const port = process.env.PORT || 3000;

// Gmail SMTP transporter — uses GMAIL_USER and GMAIL_APP_PASSWORD from .env
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

const SENDER = `TechShowdown 2026 <${process.env.GMAIL_USER}>`;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static assets (images, CSS, JS)

// Enable trust proxy for production environments (e.g. Render/Railway)
app.set('trust proxy', 1);

// ── Device Name Registry ────────────────────────────────────

const DEVICE_NAMES = {
    iphone: 'iPhone 17 Pro Max',
    samsung: 'Galaxy S25 Ultra',
    macbook: 'MacBook Pro M5 Max',
    acer: 'Acer Aspire 14 AI',
};

const RETAILERS = {
    iphone: ['Optus', 'Telstra', 'JB Hi-Fi'],
    samsung: ['Optus', 'Telstra', 'JB Hi-Fi'],
    macbook: ['JB Hi-Fi', 'Officeworks'],
    acer: ['JB Hi-Fi', 'Officeworks'],
};

// ── Email Templates ─────────────────────────────────────────

// ── Shared email wrapper ──────────────────────────────────────
function emailShell(content) {
    return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0b0f1a;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0b0f1a;padding:40px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#111827;border-radius:16px;overflow:hidden;border:1px solid #1e293b;font-family:'Segoe UI',Arial,sans-serif;color:#e2e8f0;">

      <!-- Header -->
      <tr>
        <td style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%);padding:36px 40px;border-bottom:2px solid #00d2ff;">
          <p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#00d2ff;font-weight:600;">TechShowdown 2026</p>
          <p style="margin:6px 0 0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#475569;">Global Price Sentinel</p>
        </td>
      </tr>

      <!-- Body -->
      <tr><td style="padding:40px;">${content}</td></tr>

      <!-- Footer -->
      <tr>
        <td style="padding:24px 40px;border-top:1px solid #1e293b;background:#0d1117;">
          <p style="margin:0;font-size:11px;color:#475569;text-align:center;letter-spacing:1px;">TECHSHOWDOWN 2026 &mdash; GLOBAL PRICE SENTINEL &mdash; AUSTRALIA</p>
          <p style="margin:6px 0 0;font-size:11px;color:#334155;text-align:center;">You are receiving this because you registered a price alert. Scans run daily at 7:00 AM AEST.</p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body></html>`;
}

function buildConfirmationEmail(deviceName, email, retailers) {
    const retailerList = retailers.map(r =>
        `<tr><td style="padding:10px 0;border-bottom:1px solid #1e293b;font-size:14px;color:#94a3b8;">${r}</td></tr>`
    ).join('');

    return emailShell(`
        <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Monitor Activated</h2>
        <p style="margin:0 0 28px;font-size:14px;color:#94a3b8;line-height:1.6;">A price sentinel has been established for <strong style="color:#e2e8f0;">${deviceName}</strong> and alerts will be sent to <strong style="color:#00d2ff;">${email}</strong>.</p>

        <div style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:24px;margin-bottom:24px;">
          <p style="margin:0 0 16px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#475569;font-weight:600;">Retailers Being Monitored</p>
          <table width="100%" cellpadding="0" cellspacing="0">${retailerList}</table>
        </div>

        <div style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:24px;">
          <p style="margin:0 0 16px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#475569;font-weight:600;">Notification Policy</p>
          <p style="margin:0 0 8px;font-size:14px;color:#94a3b8;">Scan frequency: <strong style="color:#e2e8f0;">Daily at 7:00 AM AEST</strong></p>
          <p style="margin:0;font-size:14px;color:#94a3b8;">You will <strong style="color:#e2e8f0;">only</strong> receive an email when a price change or deal is detected. No activity means no emails.</p>
        </div>
    `);
}

function buildPriceChangeEmail(deviceName, scanResults) {
    let cards = '';
    for (const result of scanResults) {
        if (result.price === null) continue;

        cards += `
        <div style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:24px;margin-bottom:16px;">
          <p style="margin:0 0 16px;font-size:16px;color:#ffffff;line-height:1.5;">
            We have located a potential deal or price drop for your tracked device at <strong>${result.retailer}</strong>.
          </p>
          <a href="${result.url}" style="display:inline-block;background:#00d2ff;color:#0b0f1a;text-decoration:none;font-weight:700;font-size:13px;letter-spacing:1px;padding:12px 24px;border-radius:8px;">VIEW DEAL</a>
        </div>`;
    }

    const hasDrop = scanResults.some(r => r.priceDropped);
    const headingText = hasDrop ? 'Price Drop Detected' : 'Price Change Detected';
    const headingColor = hasDrop ? '#00ff66' : '#ffaa00';
    const scanTime = new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' });

    return emailShell(`
        <p style="margin:0 0 4px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${headingColor};font-weight:600;">${headingText}</p>
        <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">${deviceName}</h2>
        <p style="margin:0 0 28px;font-size:14px;color:#94a3b8;">The following retailers have reported a change in price. Act within 24&ndash;48 hours to take advantage of any price-match windows.</p>
        ${cards}
        <p style="margin:24px 0 0;font-size:12px;color:#334155;text-align:right;">Scanned at ${scanTime} AEST</p>
    `);
}

function buildDealEmail(deviceName, scanResults) {
    let cards = '';
    for (const result of scanResults) {
        if (!result.hasDeals) continue;

        cards += `
        <div style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:24px;margin-bottom:16px;">
          <p style="margin:0 0 16px;font-size:16px;color:#ffffff;line-height:1.5;">
            We have located a deal for your tracked device at <strong>${result.retailer}</strong>.
          </p>
          <a href="${result.url}" style="display:inline-block;background:#ffaa00;color:#0b0f1a;text-decoration:none;font-weight:700;font-size:13px;letter-spacing:1px;padding:12px 24px;border-radius:8px;">VIEW DEAL</a>
        </div>`;
    }

    const scanTime = new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' });

    return emailShell(`
        <p style="margin:0 0 4px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#ffaa00;font-weight:600;">Deal Detected</p>
        <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">${deviceName}</h2>
        <p style="margin:0 0 28px;font-size:14px;color:#94a3b8;">The following retailers are currently offering deals on this device. Deals can expire without notice.</p>
        ${cards}
        <p style="margin:24px 0 0;font-size:12px;color:#334155;text-align:right;">Scanned at ${scanTime} AEST</p>
    `);
}

// ── API Routes ──────────────────────────────────────────────

/**
 * POST /api/send-email — Register a new price alert
 */
app.post('/api/send-email', async (req, res) => {
    const { email, laptop, bothKeys } = req.body;

    if (!email || !laptop) {
        return res.status(400).json({ error: 'Missing email or device selection.' });
    }

    const devicesToAlert = laptop === 'both'
        ? (Array.isArray(bothKeys) ? bothKeys : ['iphone', 'samsung'])
        : [laptop];

    for (const key of devicesToAlert) {
        if (!DEVICE_NAMES[key]) {
            return res.status(400).json({ error: `Unknown device: ${key}` });
        }
    }

    try {
        for (const key of devicesToAlert) {
            const deviceName = DEVICE_NAMES[key];
            const retailers = RETAILERS[key] || [];

            // 1. Persist the alert
            alertStore.addAlert(email, key);

            // 2. Send confirmation email
            await transporter.sendMail({
                from: SENDER,
                to: email,
                subject: `Sentinel Price Alert Activated — ${deviceName}`,
                html: buildConfirmationEmail(deviceName, email, retailers),
            });

            console.log(`[ALERT] Registered: ${email} → ${deviceName}`);
        }

        res.json({ success: true });
    } catch (err) {
        console.error('[EMAIL] System Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * GET /api/alerts — View all registered alerts (debug/admin)
 */
app.get('/api/alerts', (req, res) => {
    const alerts = alertStore.getAlerts();
    const prices = alertStore.loadPrices();
    res.json({ alerts, prices, totalAlerts: alerts.length });
});

/**
 * GET /api/health — Server heartbeat check for frontend
 */
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'online', 
        uptime: process.uptime(),
        sentinel_engine: 'active',
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /api/latest-prices — Get last-scanned prices for all devices
 */
app.get('/api/latest-prices', (req, res) => {
    const prices = alertStore.loadPrices();
    res.json({ prices });
});

/**
 * GET /api/scan-now — Manually trigger a full price scan (for testing)
 */
app.get('/api/scan-now', async (req, res) => {
    console.log('[MANUAL] Scan triggered via API...');
    const results = await executeDailyScan();
    res.json({ success: true, results });
});

/**
 * GET /api/download-pdf — Generate and download a comparison PDF
 */
app.get('/api/download-pdf', async (req, res) => {
    const { type } = req.query;
    const baseUrl = `http://localhost:${port}`;
    const targetUrl = type === 'phones' ? `${baseUrl}/phones?print=true` : `${baseUrl}/?print=true`;
    const filename = type === 'phones' ? 'TechShowdown_2026_Phones_Detailed.pdf' : 'TechShowdown_2026_Laptops_Detailed.pdf';

    console.log(`[PDF] Request received for type: ${type}`);

    try {
        const pdfBuffer = await pdfGenerator.createPdf(targetUrl);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(pdfBuffer);
    } catch (err) {
        console.error('[PDF] API Error:', err);
        res.status(500).send('Error generating PDF report. Please ensure the server has Chromium installed.');
    }
});

// ── Static Web Hosting ──────────────────────────────────────

// Serve dynamic logo generation directly from artifacts
app.get('/assets/techshowdown_logo.png', (req, res) => {
    res.sendFile('/home/raminwalif/.gemini/antigravity/brain/dd2b1efc-f542-4be0-b293-736fca059397/techshowdown_logo_1775694849873.png');
});

// Serve all static assets (CSS, JS, Images)
app.use(express.static(__dirname));

// Route for Laptops (Home) — both / and /index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route for Laptops — both /laptops and /laptops.html
app.get('/laptops', (req, res) => {
    res.sendFile(path.join(__dirname, 'laptops.html'));
});
app.get('/laptops.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'laptops.html'));
});

// Route for Phones — both /phones and /phones.html
app.get('/phones', (req, res) => {
    res.sendFile(path.join(__dirname, 'phones.html'));
});
app.get('/phones.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'phones.html'));
});

// Route for Software Guide — both /guide and /guide.html
app.get('/guide', (req, res) => {
    res.sendFile(path.join(__dirname, 'guide.html'));
});
app.get('/guide.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'guide.html'));
});

// ── Manual Auto-Fix Trigger API ────────────────────────────
app.get('/api/autofix', async (req, res) => {
    console.log('\n[API] Manual Auto-Fix Engine triggered via /api/autofix');
    try {
        // Run async, don't await (can take a few seconds)
        runAutoFix()
            .then(report => console.log(`[API] Auto-Fix done: ${report.fixesApplied.length} fixes applied.`))
            .catch(err => console.error('[API] Auto-Fix error:', err.message));

        res.json({
            success: true,
            message: 'Auto-Fix Engine started. Check /autofix_report.json for results.',
            reportUrl: '/autofix_report.json',
            logNote: 'Results appended to autofix.log',
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── Auto-Fix Report Viewer ─────────────────────────────────
app.get('/api/autofix/report', (req, res) => {
    const reportPath = require('path').join(__dirname, 'autofix_report.json');
    if (require('fs').existsSync(reportPath)) {
        res.sendFile(reportPath);
    } else {
        res.json({ message: 'No report yet. Run /api/autofix first.' });
    }
});

// ── Global Research Nexus API (2026 Industry Index) ──────────

const TECHNICAL_ORACLE_DB = {
    'm5 max': {
        title: 'Apple M5 Max: Silicon Architectural Whitepaper',
        sections: [
            {
                tag: 'Phase I',
                header: 'Executive Summary',
                content: "The Apple M5 Max represents the definitive transition of the MacBook Pro line from a mobile creative device to a high-fidelity 'Sentient Workstation.' Fabricated on TSMC's proprietary 3nm Enhanced N3E nanosheet process, the M5 Max integrates 114 billion transistors across a unified die, facilitating unprecedented multi-threaded efficiency."
            },
            {
                tag: 'Phase II',
                header: 'Semiconductor Topology',
                content: "The core architecture leverages a 14-core Fusion Matrix, utilizing ten 'Everest' Performance cores and four 'Sawtooth' Efficiency cores. By implementing a revised Branch Prediction Unit (BPU) with a significantly enlarged L1/L2 cache hierarchy, the M5 Max achieves a cycle-per-instruction (CPI) reduction of 22% compared to the M3 Max baseline."
            },
            {
                tag: 'Phase III',
                header: 'Neural Infrastructure',
                content: "The 5th Generation Neural Engine (68 TOPS) introduces dedicated hardware logic for 'Transformer Acceleration.' This allows the M5 Max to execute local Large Language Models (LLMs) with up to 70 billion parameters at native speeds, ensuring absolute data sovereignty for enterprise-grade research."
            }
        ]
    },
    'lunar lake': {
        title: 'Intel Core Ultra 200V: Efficiency-First Analysis',
        sections: [
            {
                tag: 'Audit I',
                header: 'Efficiency Paradigm',
                content: "The Intel Lunar Lake architecture marks a paradigm shift for the x86 ecosystem, prioritizing 'Ambient Intelligence' and extreme battery longevity over raw multi-core brute force. It is the flagship architecture for the 2026 'Executive Mobility' segment."
            },
            {
                tag: 'Audit II',
                header: 'Memory-on-Package Logistics',
                content: "In a historical first, LPDDR5X-8533 memory is integrated directly onto the silicon package. This reduces communication latency to the absolute minimum and frees up 25% of the traditional PCB area, allowing for larger battery volumes in 12-14 inch chassis."
            },
            {
                tag: 'Audit III',
                header: 'Background Autonomy',
                content: "The dedicated 48 TOPS NPU is uniquely engineered for 'Background Autonomy.' It handles persistent eye-tracking, real-time audio isolation, and OS-level predictive action synthesis as a permanent background service, consuming less than 1W of power."
            }
        ]
    },
    'iphone 17 pro max': {
        title: 'Apple A19 Pro: 2nm Neural Architecture',
        sections: [
            {
                tag: 'Report Alpha',
                header: 'The 2nm Deployment',
                content: "The A19 Pro System-on-Chip (SoC) is the industry’s first global deployment of 2nm semiconductor fabrication. It is designed to act as a 'Privacy-First Personal Intelligence Node,' integrating cinematic imaging with hardware-isolated AI context."
            },
            {
                tag: 'Report Beta',
                header: 'Optical Throughput',
                content: "The 48MP Tetraprism sensor architecture has been upgraded to support 12-bit Log-ProRes recording at 120fps directly to external NVMe storage via a high-speed USB-C 4.0 link. The AI-driven 100x hybrid zoom system utilizes a dedicated ISP capable of 1.4 quintillion operations per second."
            },
            {
                tag: 'Report Gamma',
                header: 'Secure Neural Enclave',
                content: "At the heart of the A19 Pro is the 'Secure Neural Enclave,' an air-gapped silicon portion that stores local LLM personality weights and biometric data independently of the main kernel, ensuring enterprise-grade data sovereignty."
            }
        ]
    },
    'galaxy s25 ultra': {
        title: 'Samsung S25 Ultra: Snapdragon 8 Gen 4 Strategy',
        sections: [
            {
                tag: 'Vector I',
                header: 'Custom Oryon Core Logic',
                content: "The Snapdragon 8 Gen 4 processor features custom Oryon cores that deliver desktop-class single-threaded performance. This architecture is tuned for 'Action Synthesis,' allowing the device to proactively automate multi-app workflows based on historical user behavior patterns."
            },
            {
                tag: 'Vector II',
                header: 'Generative Denoising ISP',
                content: "The 200MP ISOCELL sensor utilizes Deep-Trench Isolation (DTI) 2.0 to capture a higher signal-to-noise ratio. The new 100x Space Zoom is powered by a custom NPU layer that performs 'Generative Denoising,' creating sharp, usable images even at extreme magnifications."
            },
            {
                tag: 'Vector III',
                header: 'Haptic Texture Simulation',
                content: "Productivity is further enhanced by the new 0.7ms S-Pen with integrated AI haptic feedback that simulates the friction of various pen-and-paper textures. The X80 Modem-RF system uses AI to optimize signal reception in high-density urban environments."
            }
        ]
    }
};

/**
 * GET /api/research?q=...
 * Performs fuzzy semantic matching against the Oracle DB.
 * Uses a keyword overlap score to determine the best technical match.
 */
app.get('/api/research', (req, res) => {
    const query = (req.query.q || '').toLowerCase().replace(/[?.,!]/g, '');
    const queryTerms = query.split(/\s+/).filter(t => t.length > 2);
    
    // Simulate thinking/search delay
    const delay = 1500; 

    setTimeout(() => {
        let bestMatch = null;
        let highestScore = 0;

        for (const [key, data] of Object.entries(TECHNICAL_ORACLE_DB)) {
            let score = 0;
            const keyTerms = key.split(/\s+/);
            
            // Check for direct key matches
            if (query.includes(key)) score += 10;

        // Check for individual term overlaps
        queryTerms.forEach(qt => {
            if (keyTerms.includes(qt)) score += 5;
            if (data.title.toLowerCase().includes(qt)) score += 2;
            data.sections.forEach(sec => {
                if (sec.header.toLowerCase().includes(qt)) score += 2;
                if (sec.content.toLowerCase().includes(qt)) score += 1;
            });
        });

        if (score > highestScore) {
            highestScore = score;
            bestMatch = data;
        }
    }

    // Logic Threshold: Only return if we have a reasonable confidence score
    if (bestMatch && highestScore >= 5) {
        const sectionsHtml = bestMatch.sections.map(sec => `
            <div class="dossier-section">
                <span class="dossier-header-tag">${sec.tag}</span>
                <h3 class="dossier-section-title">${sec.header}</h3>
                <p class="dossier-content-text">${sec.content}</p>
            </div>
        `).join('');

        const report = `
<div class="technical-whitepaper">
<h2 style="color: #fff; border-bottom: 2px solid rgba(255,255,255,0.1); padding-bottom: 20px; margin-bottom: 50px; font-family: 'Outfit'; font-weight: 800; letter-spacing: -0.5px; font-size: 1.8rem;">
    OFFICIAL TECHNICAL DOSSIER: ${bestMatch.title}
</h2>

${sectionsHtml}

<div class="dossier-divider"></div>
<div style="padding: 20px; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;">
    <div>
        <strong style="color: var(--accent-purple); text-transform: uppercase; font-size: 0.65rem; letter-spacing: 2px; font-weight: 800;">Data Integrity Index:</strong>
        <span style="color: #fff; margin-left: 15px; font-size: 0.85rem; font-family: 'Outfit';">${highestScore > 15 ? 'ARCHITECTURAL GRADE' : 'SYNTHESIZED CONTEXT'}</span>
    </div>
    <span style="font-size: 0.65rem; color: #555; font-family: 'Outfit'; font-weight: 700; letter-spacing: 1px;">GRN-ID: 2026-XQ.07</span>
</div>
</div>
        `.trim();
        res.json({ success: true, source: 'Global Research Oracle', data: report, score: highestScore });
    } else {
            res.json({ 
                success: false, 
                message: 'Inadequate local confidence. Escalate to Distributed Web Index.',
                query: query 
            });
        }
    }, delay);
});

// ── Daily Scan Execution ────────────────────────────────────

async function executeDailyScan() {
    const scanResults = await priceScanner.runFullScan();
    let emailsSent = 0;
    let skipped = 0;

    for (const [deviceKey, results] of Object.entries(scanResults)) {
        const deviceName = DEVICE_NAMES[deviceKey];
        const alerts = alertStore.getAlerts(deviceKey);
        
        // Determine what actually happened
        const hasPriceChange = results.some(r => r.priceChanged);
        const hasDeals = results.some(r => r.hasDeals);
        const hasAnyPrice = results.some(r => r.price !== null);

        // ─── CORE RULE: Only email if something noteworthy happened ───
        if (!hasPriceChange && !hasDeals) {
            console.log(`[NOTIFY] ${deviceName}: No price changes or deals detected — NO emails sent.`);
            skipped++;
            continue;
        }

        if (!hasAnyPrice && !hasDeals) {
            console.log(`[NOTIFY] ${deviceName}: No data retrieved — NO emails sent.`);
            skipped++;
            continue;
        }

        // Something worth reporting — notify all registered users
        for (const alert of alerts) {
            try {
                if (hasPriceChange) {
                    // Price changed (drop or increase)
                    const hasDrop = results.some(r => r.priceDropped);
                    const subject = hasDrop
                        ? `⬇ PRICE DROP — ${deviceName}`
                        : `🔄 Price Change — ${deviceName}`;

                    await transporter.sendMail({
                        from: SENDER,
                        to: alert.email,
                        subject,
                        html: buildPriceChangeEmail(deviceName, results),
                    });
                    console.log(`[NOTIFY] Price change email → ${alert.email} (${deviceName})`);
                    emailsSent++;

                } else if (hasDeals) {
                    // No price change, but deals/offers detected
                    await transporter.sendMail({
                        from: SENDER,
                        to: alert.email,
                        subject: `Deal Alert — ${deviceName}`,
                        html: buildDealEmail(deviceName, results),
                    });
                    console.log(`[NOTIFY] Deal alert email → ${alert.email} (${deviceName})`);
                    emailsSent++;
                }

            } catch (err) {
                console.error(`[NOTIFY] Failed to email ${alert.email}: ${err.message}`);
            }
        }
    }

    console.log(`\n[SCAN COMPLETE] Emails sent: ${emailsSent} | Devices skipped (no changes): ${skipped}\n`);
    return scanResults;
}

// ── Cron Scheduler ──────────────────────────────────────────
// Daily price scan — 7:00 AM Sydney time (AEST/AEDT)
cron.schedule('0 7 * * *', () => {
    console.log('\n[CRON] Scheduled daily scan triggered.');
    executeDailyScan();
}, { timezone: 'Australia/Sydney' });

// Monthly auto-fix — 1st of every month at 3:00 AM Sydney time
cron.schedule('0 3 1 * *', async () => {
    console.log('\n[CRON] Monthly Auto-Fix Engine triggered.');
    try {
        await runAutoFix();
        console.log('[CRON] Auto-Fix Engine completed successfully.');
    } catch (err) {
        console.error('[CRON] Auto-Fix Engine failed:', err.message);
    }
}, { timezone: 'Australia/Sydney' });

// ── Server Boot ─────────────────────────────────────────────

app.listen(port, () => {
    const alerts = alertStore.getAlerts();
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`  TechShowdown 2026 — Price Sentinel Server`);
    console.log(`  Port: ${port}`);
    console.log(`  Active Alerts: ${alerts.length}`);
    console.log(`  Daily Scan: 7:00 AM AEST (cron active)`);
    console.log(`  Monthly Auto-Fix: 1st of month, 3:00 AM AEST (cron active)`);
    console.log(`  Notification Policy: ONLY on price changes or deals`);
    console.log(`  Manual Scan: GET http://localhost:${port}/api/scan-now`);
    console.log(`  Manual Auto-Fix: GET http://localhost:${port}/api/autofix`);
    console.log(`  Auto-Fix Report: GET http://localhost:${port}/api/autofix/report`);
    console.log(`  View Alerts: GET http://localhost:${port}/api/alerts`);
    console.log(`  Software Guide: http://localhost:${port}/guide`);
    console.log(`${'═'.repeat(60)}\n`);
});
