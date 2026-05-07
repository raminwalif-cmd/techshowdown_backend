/**
 * priceScanner.js — Puppeteer-powered retailer price scanner.
 * 
 * Uses a headless Chromium browser to fully render JS-heavy Australian
 * retail sites, then extracts prices and deal indicators from the live DOM.
 * Only flags results when a price has CHANGED or a deal/offer is detected.
 */

const puppeteer = require('puppeteer');
const alertStore = require('./alertStore');

// ── Retailer Scan Targets ───────────────────────────────────

const SCAN_TARGETS = {
    iphone: [
        {
            retailer: 'JB Hi-Fi',
            url: 'https://www.jbhifi.com.au/search?query=iphone+17+pro+max',
            searchTerms: ['iphone 17', 'iphone17', 'pro max'],
        },
        {
            retailer: 'Telstra',
            url: 'https://www.telstra.com.au/mobile-phones?search=iPhone+17+Pro+Max',
            searchTerms: ['iphone 17', 'iphone17', 'pro max'],
        },
        {
            retailer: 'Optus',
            url: 'https://www.optus.com.au/shop/mobile/phones?q=iPhone+17+Pro+Max',
            searchTerms: ['iphone 17', 'iphone17', 'pro max'],
        },
    ],
    samsung: [
        {
            retailer: 'JB Hi-Fi',
            url: 'https://www.jbhifi.com.au/search?query=samsung+galaxy+s25+ultra',
            searchTerms: ['galaxy s25', 's25 ultra', 'samsung'],
        },
        {
            retailer: 'Telstra',
            url: 'https://www.telstra.com.au/mobile-phones?search=Galaxy+S25+Ultra',
            searchTerms: ['galaxy s25', 's25 ultra', 'samsung'],
        },
        {
            retailer: 'Optus',
            url: 'https://www.optus.com.au/shop/mobile/phones?q=Galaxy+S25+Ultra',
            searchTerms: ['galaxy s25', 's25 ultra', 'samsung'],
        },
    ],
    macbook: [
        {
            retailer: 'JB Hi-Fi',
            url: 'https://www.jbhifi.com.au/search?query=macbook+pro+m5+max',
            searchTerms: ['macbook', 'm5 max', 'apple'],
        },
        {
            retailer: 'Officeworks',
            url: 'https://www.officeworks.com.au/shop/officeworks/search?q=macbook+pro+m5+max&view=grid&page=1&sortby=tmp_priceSort&ascending=true',
            searchTerms: ['macbook', 'm5 max', 'apple'],
        },
    ],
    acer: [
        {
            retailer: 'JB Hi-Fi',
            url: 'https://www.jbhifi.com.au/search?query=acer+aspire+14+ai',
            searchTerms: ['acer', 'aspire 14', 'aspire14'],
        },
        {
            retailer: 'Officeworks',
            url: 'https://www.officeworks.com.au/shop/officeworks/search?q=acer+aspire+14+ai&view=grid&page=1&sortby=tmp_priceSort&ascending=true',
            searchTerms: ['acer', 'aspire 14', 'aspire14'],
        },
    ],
};

// Deal/offer keywords to scan for in the page
const DEAL_KEYWORDS = [
    'sale', 'special', 'deal', 'offer', 'save $', 'save up to',
    'bonus', 'free', 'bundle', 'discount', 'reduced', 'clearance',
    'was $', 'now $', 'price drop', 'limited time', 'flash sale',
    'member price', 'online only', '% off', 'trade-in',
];

// ── Browser Management ──────────────────────────────────────

let browserInstance = null;

async function getBrowser() {
    if (!browserInstance) {
        browserInstance = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--window-size=1920,1080',
            ],
        });
    }
    return browserInstance;
}

async function closeBrowser() {
    if (browserInstance) {
        await browserInstance.close();
        browserInstance = null;
    }
}

// ── Page Scraping Logic ─────────────────────────────────────

/**
 * Scrape a single retailer page using Puppeteer.
 * Waits for full JS render, then extracts prices and deal indicators.
 */
async function scrapePage(target) {
    const browser = await getBrowser();
    let page;

    try {
        page = await browser.newPage();

        // Set a realistic viewport and user agent
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
        );

        // Block images/media to speed up loading
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            const type = req.resourceType();
            if (['image', 'media', 'font'].includes(type)) {
                req.abort();
            } else {
                req.continue();
            }
        });

        console.log(`[SCANNER] Navigating to ${target.retailer}: ${target.url}`);

        await page.goto(target.url, {
            waitUntil: 'networkidle2',
            timeout: 30000,
        });

        // Smart Wait: Try to identify a price container before proceeding
        try {
            // Wait for common price-related classes or data attributes
            await page.waitForSelector('.price, [data-price], [class*="Price"], [class*="price-box"]', { timeout: 8000 });
        } catch (e) {
            console.log(`[SCANNER]   (Smart Wait timed out for ${target.retailer}, falling back to full-page text scan)`);
        }

        // Give JS extra time to stabilize
        await new Promise(r => setTimeout(r, 2000));

        // Extract all text content from the page for price and deal analysis
        const pageData = await page.evaluate((dealKeywords) => {
            const body = document.body;
            if (!body) return { prices: [], deals: [], fullText: '' };

            const fullText = body.innerText.toLowerCase();

            // ── Extract prices ──
            // Find all elements that might contain prices
            const priceElements = document.querySelectorAll(
                '[class*="price"], [data-price], [class*="Price"], ' +
                '[class*="cost"], [class*="amount"], [class*="dollar"], ' +
                'span, strong, b, p, div, h1, h2, h3, h4'
            );

            const prices = [];
            const seen = new Set();

            for (const el of priceElements) {
                const text = el.textContent.trim();
                // Match Australian dollar amounts like $1,299.00 or $999
                const matches = text.match(/\$\s*([\d,]+\.?\d{0,2})/g);
                if (matches) {
                    for (const m of matches) {
                        const val = parseFloat(m.replace(/[$,\s]/g, ''));
                        // Filter reasonable product prices (not shipping costs or tiny amounts)
                        if (val >= 100 && val <= 15000 && !seen.has(val)) {
                            seen.add(val);
                            prices.push(val);
                        }
                    }
                }
            }

            // ── Detect deals/offers ──
            const deals = [];
            for (const keyword of dealKeywords) {
                if (fullText.includes(keyword.toLowerCase())) {
                    // Find context around the keyword
                    const idx = fullText.indexOf(keyword.toLowerCase());
                    const start = Math.max(0, idx - 40);
                    const end = Math.min(fullText.length, idx + keyword.length + 60);
                    const context = fullText.substring(start, end).replace(/\n/g, ' ').trim();
                    deals.push({ keyword, context });
                }
            }

            return { prices: prices.sort((a, b) => a - b), deals, fullText: fullText.substring(0, 2000) };
        }, DEAL_KEYWORDS);

        await page.close();

        // Pick the most likely product price (first reasonable one)
        const price = pageData.prices.length > 0 ? pageData.prices[0] : null;

        // Filter deals to only relevant ones (containing search terms)
        const relevantDeals = pageData.deals.filter(d => {
            const ctx = d.context.toLowerCase();
            return target.searchTerms.some(term => ctx.includes(term.toLowerCase()));
        });

        return {
            price,
            allPrices: pageData.prices,
            deals: relevantDeals,
            hasDeals: relevantDeals.length > 0,
            productUrl: target.url,
        };

    } catch (err) {
        console.error(`[SCANNER] Error scraping ${target.retailer}: ${err.message}`);
        if (page) await page.close().catch(() => {});
        return {
            price: null,
            allPrices: [],
            deals: [],
            hasDeals: false,
            productUrl: target.url,
            error: err.message,
        };
    }
}

// ── Core Scanner Logic ──────────────────────────────────────

/**
 * Scan all retailers for a specific device.
 * Compares prices against stored history to detect changes.
 */
async function scanDevice(deviceKey) {
    const targets = SCAN_TARGETS[deviceKey];
    if (!targets) {
        console.error(`[SCANNER] No scan targets for device: ${deviceKey}`);
        return [];
    }

    const results = [];

    for (const target of targets) {
        // Random jitter delay (1-4 seconds) between retailers to avoid bot detection
        const jitter = Math.floor(Math.random() * 3000) + 1000;
        await new Promise(r => setTimeout(r, jitter));

        const scrapeResult = await scrapePage(target);

        let previousPrice = null;
        let priceChanged = false;
        let priceDropped = false;
        let priceIncreased = false;

        if (scrapeResult.price !== null) {
            const stored = alertStore.setLastPrice(
                deviceKey, target.retailer, scrapeResult.price, scrapeResult.productUrl
            );
            previousPrice = stored.previousPrice;

            if (previousPrice !== null && scrapeResult.price !== previousPrice) {
                priceChanged = true;
                priceDropped = scrapeResult.price < previousPrice;
                priceIncreased = scrapeResult.price > previousPrice;
            }
        }

        const result = {
            retailer: target.retailer,
            price: scrapeResult.price,
            allPrices: scrapeResult.allPrices,
            previousPrice,
            url: scrapeResult.productUrl,
            priceChanged,
            priceDropped,
            priceIncreased,
            deals: scrapeResult.deals,
            hasDeals: scrapeResult.hasDeals,
            error: scrapeResult.error || null,
        };

        results.push(result);

        // Logging
        const priceStr = scrapeResult.price !== null ? `$${scrapeResult.price}` : 'No price found';
        let status = '';
        if (priceDropped) status = ' ⬇ PRICE DROP!';
        else if (priceIncreased) status = ' ⬆ Price increased';
        else if (priceChanged) status = ' 🔄 Price changed';
        if (scrapeResult.hasDeals) status += ` 🏷️ ${scrapeResult.deals.length} deal(s) found`;

        console.log(`[SCANNER]   → ${target.retailer}: ${priceStr}${status}`);
    }

    return results;
}

/**
 * Run a full scan across all devices that have active alerts.
 * Returns a map of deviceKey → scan results.
 */
async function runFullScan() {
    const allAlerts = alertStore.getAlerts();
    const deviceKeys = [...new Set(allAlerts.map(a => a.deviceKey))];

    if (deviceKeys.length === 0) {
        console.log('[SCANNER] No active alerts registered. Skipping scan.');
        return {};
    }

    console.log(`\n${'═'.repeat(60)}`);
    console.log(`[SCANNER] Daily Price Scan — ${new Date().toISOString()}`);
    console.log(`[SCANNER] Active alerts for: ${deviceKeys.join(', ')}`);
    console.log(`${'═'.repeat(60)}\n`);

    const scanResults = {};

    for (const deviceKey of deviceKeys) {
        console.log(`\n[SCANNER] ── Scanning: ${deviceKey.toUpperCase()} ──`);
        scanResults[deviceKey] = await scanDevice(deviceKey);
    }

    // Close browser after full scan to free resources
    await closeBrowser();

    console.log(`\n[SCANNER] Scan complete.\n`);
    return scanResults;
}

module.exports = {
    scanDevice,
    runFullScan,
    closeBrowser,
    SCAN_TARGETS,
};
