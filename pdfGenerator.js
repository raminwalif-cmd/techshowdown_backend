/**
 * pdfGenerator.js (Stubbed)
 * 
 * Removes Puppeteer dependency for lightweight, 100% stable cloud deployment.
 * Returns static PDF files or guides directly.
 */

const fs = require('fs');
const path = require('path');

async function createPdf(url) {
    console.log(`[PDF] Stubbed report generator called for: ${url}`);
    
    // Instead of generating a PDF dynamically using Puppeteer, we can serve
    // a pre-built static PDF or raise a friendly error indicating cloud server environment limits.
    const staticPdfPath = path.join(__dirname, 'assets', 'Sentinel_Laptop_Whitepaper_2026.pdf');
    if (fs.existsSync(staticPdfPath)) {
        return fs.readFileSync(staticPdfPath);
    }
    
    throw new Error('Dynamic PDF Generation is disabled in cloud hosting. Please use static download instead.');
}

module.exports = { createPdf };
