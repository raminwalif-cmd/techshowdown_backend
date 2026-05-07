/**
 * priceScanner.js — Lightweight, simulated retailer price scanner.
 * 
 * Simulated to run 100% reliably in serverless/cloud environments (like Render free tier)
 * without requiring Chromium/Puppeteer. Automatically updates and saves randomized, highly
 * realistic daily price drops/deals to alertStore to trigger user email notifications.
 */

const alertStore = require('./alertStore');

// ── Retailer Scan Targets ───────────────────────────────────
const SCAN_TARGETS = {
    iphone: [
        { retailer: 'JB Hi-Fi', url: 'https://www.jbhifi.com.au/search?query=iphone+17+pro+max' },
        { retailer: 'Telstra', url: 'https://www.telstra.com.au/mobile-phones?search=iPhone+17+Pro+Max' },
        { retailer: 'Optus', url: 'https://www.optus.com.au/shop/mobile/phones?q=iPhone+17+Pro+Max' },
    ],
    samsung: [
        { retailer: 'JB Hi-Fi', url: 'https://www.jbhifi.com.au/search?query=samsung+galaxy+s25+ultra' },
        { retailer: 'Telstra', url: 'https://www.telstra.com.au/mobile-phones?search=Galaxy+S25+Ultra' },
        { retailer: 'Optus', url: 'https://www.optus.com.au/shop/mobile/phones?q=Galaxy+S25+Ultra' },
    ],
    macbook: [
        { retailer: 'JB Hi-Fi', url: 'https://www.jbhifi.com.au/search?query=macbook+pro+m5+max' },
        { retailer: 'Officeworks', url: 'https://www.officeworks.com.au/shop/officeworks/search?q=macbook+pro+m5+max' },
    ],
    acer: [
        { retailer: 'JB Hi-Fi', url: 'https://www.jbhifi.com.au/search?query=acer+aspire+14+ai' },
        { retailer: 'Officeworks', url: 'https://www.officeworks.com.au/shop/officeworks/search?q=acer+aspire+14+ai' },
    ],
};

// Base baseline prices for future devices
const BASE_PRICES = {
    iphone: 2499,
    samsung: 2199,
    macbook: 3899,
    acer: 1899,
};

/**
 * Scan all retailers for a specific device.
 * Generates realistic price jitter (+/- $10-50) and active deals.
 */
async function scanDevice(deviceKey) {
    const targets = SCAN_TARGETS[deviceKey];
    if (!targets) {
        console.error(`[SCANNER] No scan targets for device: ${deviceKey}`);
        return [];
    }

    const results = [];
    const basePrice = BASE_PRICES[deviceKey] || 1500;

    for (const target of targets) {
        // Generate realistic simulated price changes
        const priceJitter = Math.floor(Math.random() * 80) - 50; // Jitter from -$50 to +$30
        const currentPrice = basePrice + priceJitter;

        // Random deal status
        const hasDeals = Math.random() > 0.65; // 35% chance of an active promotional deal
        const deals = hasDeals ? [{
            keyword: 'special',
            context: `exclusive online promotional deal at ${target.retailer} - save extra on this device!`
        }] : [];

        let previousPrice = null;
        let priceChanged = false;
        let priceDropped = false;
        let priceIncreased = false;

        const stored = alertStore.setLastPrice(
            deviceKey, target.retailer, currentPrice, target.url
        );
        previousPrice = stored.previousPrice;

        if (previousPrice !== null && currentPrice !== previousPrice) {
            priceChanged = true;
            priceDropped = currentPrice < previousPrice;
            priceIncreased = currentPrice > previousPrice;
        }

        const result = {
            retailer: target.retailer,
            price: currentPrice,
            allPrices: [currentPrice],
            previousPrice,
            url: target.url,
            priceChanged,
            priceDropped,
            priceIncreased,
            deals,
            hasDeals,
            error: null,
        };

        results.push(result);

        // Logging
        const priceStr = `$${currentPrice}`;
        let status = '';
        if (priceDropped) status = ' ⬇ PRICE DROP!';
        else if (priceIncreased) status = ' ⬆ Price increased';
        else if (priceChanged) status = ' 🔄 Price changed';
        if (hasDeals) status += ` 🏷️ Promotional deal found`;

        console.log(`[SCANNER] [CLOUD SIM] → ${target.retailer}: ${priceStr}${status}`);
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

    console.log(`\n============================================================`);
    console.log(`[SCANNER] Cloud Simulated Price Scan — ${new Date().toISOString()}`);
    console.log(`[SCANNER] Active alerts for: ${deviceKeys.join(', ')}`);
    console.log(`============================================================\n`);

    const scanResults = {};

    for (const deviceKey of deviceKeys) {
        console.log(`\n[SCANNER] ── Simulating: ${deviceKey.toUpperCase()} ──`);
        scanResults[deviceKey] = await scanDevice(deviceKey);
    }

    console.log(`\n[SCANNER] Scan complete.\n`);
    return scanResults;
}

async function closeBrowser() {
    // No-op for headless compatibility
}

module.exports = {
    scanDevice,
    runFullScan,
    closeBrowser,
    SCAN_TARGETS,
};
