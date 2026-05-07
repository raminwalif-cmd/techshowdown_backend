/**
 * index.js — Firebase Cloud Functions for TechShowdown 2026
 */
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const alertStore = require('./alertStore');

// Gmail SMTP transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

const SENDER = `TechShowdown 2026 <${process.env.GMAIL_USER}>`;

const DEVICE_NAMES = {
    'mac-m5-max': 'MacBook Pro M5 Max',
    'acer-aspire-ai': 'Acer Aspire 14 AI',
    'iphone-16-pro': 'iPhone 16 Pro Max',
    'galaxy-s25-ultra': 'Samsung Galaxy S25 Ultra'
};

const RETAILERS = {
    'mac-m5-max': [
        { name: "JB Hi-Fi", price: 3499 },
        { name: "Apple Store", price: 3999 }
    ],
    'acer-aspire-ai': [
        { name: "JB Hi-Fi", price: 1899 },
        { name: "Acer Online", price: 1999 }
    ]
};

/**
 * API: Health Check
 */
app.get('/api/health', (req, res) => {
    res.json({ status: 'online', environment: 'firebase-cloud' });
});

/**
 * API: Register Alert
 */
app.post('/api/alerts/register', async (req, res) => {
    try {
        const { email, key } = req.body;
        if (!email || !key) return res.status(400).json({ error: 'Missing email or key' });

        const deviceName = DEVICE_NAMES[key] || key;
        
        // 1. Persist
        alertStore.addAlert(email, key);

        // 2. Send Email
        await transporter.sendMail({
            from: SENDER,
            to: email,
            subject: `Sentinel Price Alert Activated — ${deviceName}`,
            html: `
                <div style="font-family: sans-serif; background: #080810; color: #fff; padding: 40px; border-radius: 20px;">
                    <h2 style="color: #00d2ff; letter-spacing: 2px;">SENTINEL ACTIVATED</h2>
                    <p>Your price watch for <b>${deviceName}</b> is now live in the TechShowdown 2026 cloud matrix.</p>
                    <p>We will notify you immediately if a price drop or deal is detected.</p>
                    <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 20px 0;">
                    <p style="font-size: 0.8rem; color: #888;">Technical Handshake Verified • ramin.walif@gmail.com relay</p>
                </div>
            `,
        });

        res.json({ success: true });
    } catch (err) {
        console.error('Cloud Function Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Export the app as a Cloud Function
exports.sentinelApi = functions.https.onRequest(app);
