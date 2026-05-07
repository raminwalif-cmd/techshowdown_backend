const puppeteer = require('puppeteer');
const path = require('path');

async function takeScreenshot() {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    
    try {
        console.log('Navigating to http://localhost:5000...');
        await page.goto('http://localhost:5000', { waitUntil: 'networkidle2' });
        
        const screenshotPath = path.join(__dirname, 'assets', 'website_preview.png');
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log('Screenshot saved to:', screenshotPath);
    } catch (err) {
        console.error('Error taking screenshot:', err);
    } finally {
        await browser.close();
    }
}

takeScreenshot();
