/**
 * pdfGenerator.js
 * 
 * Generates a high-fidelity PDF from a given URL using Puppeteer.
 * Optimized for 'TechShowdown 2026' A4 report formatting.
 */

const puppeteer = require('puppeteer');

async function createPdf(url) {
    console.log(`[PDF] Generating report for: ${url}`);
    
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--font-render-hinting=none'
            ]
        });

        const page = await browser.newPage();
        
        // Emulate screen for CSS media queries or 'print' specifically
        await page.emulateMediaType('print');

        // Navigate and wait for content
        await page.goto(url, { 
            waitUntil: ['networkidle0', 'domcontentloaded'],
            timeout: 30000 
        });

        // Advanced Injection: Hide UI elements for the print report
        await page.addStyleTag({
            content: `
                .new-pdf-btn, .sentinel-export-btn, #export-console-modal, 
                .nav-trigger, .recommender-section, .ai-search-nav,
                #ai-response-box, .lightbox-close, #image-lightbox { 
                    display: none !important; 
                }
                body { background: #fff !important; color: #000 !important; }
                .product-column { break-inside: avoid; }
            `
        });

        // Small extra delay to ensure any JS-driven charts/bars animate to completion
        await new Promise(r => setTimeout(r, 1500));

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            preferCSSPageSize: true,
            margin: {
                top: '20mm',
                right: '15mm',
                bottom: '20mm',
                left: '15mm'
            },
            displayHeaderFooter: true,
            headerTemplate: `
                <div style="font-size: 8px; width: 100%; text-align: center; color: #64748b; font-family: sans-serif; border-bottom: 0.5px solid #e2e8f0; padding-bottom: 5px; margin: 0 15mm;">
                    TECHSHOWDOWN 2026 | OFFICIAL HARDWARE COMPARISON REPORT
                </div>`,
            footerTemplate: `
                <div style="font-size: 8px; width: 100%; display: flex; justify-content: space-between; color: #64748b; font-family: sans-serif; border-top: 0.5px solid #e2e8f0; padding-top: 5px; margin: 0 15mm;">
                    <span>Generated on ${new Date().toLocaleDateString('en-AU')}</span>
                    <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
                </div>`,
        });

        await browser.close();
        return pdfBuffer;

    } catch (err) {
        console.error('[PDF] Generation Error:', err);
        if (browser) await browser.close();
        throw err;
    }
}

module.exports = { createPdf };
