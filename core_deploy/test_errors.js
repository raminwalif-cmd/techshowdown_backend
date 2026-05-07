const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    
    // Start local server to serve laptops.html correctly
    const { exec } = require('child_process');
    const server = exec('node server.js');
    
    await new Promise(r => setTimeout(r, 2000)); // wait for server to start
    
    try {
        await page.goto('http://localhost:3000/laptops.html', { waitUntil: 'networkidle2' });
        console.log("Page loaded successfully.");
    } catch(err) {
        console.log("GOTO ERROR:", err);
    }
    
    await browser.close();
    server.kill();
})();
