/**
 * alertStore.js — Persistent JSON-file-based alert storage.
 * Stores registered price alerts and last-known prices so the
 * daily scanner can detect price drops and send notifications.
 */

const fs = require('fs');
const path = require('path');

const STORE_PATH = path.join(__dirname, 'data', 'alerts.json');
const PRICES_PATH = path.join(__dirname, 'data', 'prices.json');

// Ensure the data directory exists
function ensureDataDir() {
    const dir = path.dirname(STORE_PATH);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// ── Alert Registration Storage ──────────────────────────────

function loadAlerts() {
    ensureDataDir();
    if (!fs.existsSync(STORE_PATH)) {
        return [];
    }
    try {
        const raw = fs.readFileSync(STORE_PATH, 'utf-8');
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

function saveAlerts(alerts) {
    ensureDataDir();
    fs.writeFileSync(STORE_PATH, JSON.stringify(alerts, null, 2), 'utf-8');
}

/**
 * Register a new price alert.
 * @param {string} email 
 * @param {string} deviceKey - e.g. 'iphone', 'samsung', 'macbook', 'acer'
 */
function addAlert(email, deviceKey) {
    const alerts = loadAlerts();
    // Prevent duplicates
    const exists = alerts.some(a => a.email === email && a.deviceKey === deviceKey);
    if (!exists) {
        alerts.push({
            email,
            deviceKey,
            registeredAt: new Date().toISOString(),
            active: true,
        });
        saveAlerts(alerts);
    }
}

/**
 * Get all active alerts, optionally filtered by device.
 */
function getAlerts(deviceKey = null) {
    const alerts = loadAlerts();
    if (deviceKey) {
        return alerts.filter(a => a.active && a.deviceKey === deviceKey);
    }
    return alerts.filter(a => a.active);
}

// ── Price History Storage ───────────────────────────────────

function loadPrices() {
    ensureDataDir();
    if (!fs.existsSync(PRICES_PATH)) {
        return {};
    }
    try {
        const raw = fs.readFileSync(PRICES_PATH, 'utf-8');
        return JSON.parse(raw);
    } catch {
        return {};
    }
}

function savePrices(prices) {
    ensureDataDir();
    fs.writeFileSync(PRICES_PATH, JSON.stringify(prices, null, 2), 'utf-8');
}

/**
 * Get the last-known price for a device at a specific retailer.
 * @returns {number|null}
 */
function getLastPrice(deviceKey, retailer) {
    const prices = loadPrices();
    const key = `${deviceKey}:${retailer}`;
    return prices[key]?.price ?? null;
}

/**
 * Store the latest scanned price.
 */
function setLastPrice(deviceKey, retailer, price, url) {
    const prices = loadPrices();
    const key = `${deviceKey}:${retailer}`;
    const previous = prices[key]?.price ?? null;

    prices[key] = {
        price,
        previousPrice: previous,
        url,
        lastChecked: new Date().toISOString(),
    };
    savePrices(prices);

    return { currentPrice: price, previousPrice: previous };
}

module.exports = {
    addAlert,
    getAlerts,
    getLastPrice,
    setLastPrice,
    loadPrices,
};
