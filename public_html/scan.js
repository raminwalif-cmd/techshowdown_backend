const puppeteer = require('puppeteer');

(async () => {
    const urls = [
        'http://localhost:3000/',
        'http://localhost:3000/phones.html',
        'http://localhost:3000/showcase.html'
    ];
    
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    let hasErrors = false;

    for (const url of urls) {
        console.log(`\n--- Scanning ${url} ---`);
        const page = await browser.newPage();
        
        page.on('console', msg => {
            if (msg.type() === 'error' || msg.type() === 'warning') {
                console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
                hasErrors = true;
            }
        });

        page.on('pageerror', err => {
            console.log(`[PAGE ERROR] ${err.message}`);
            hasErrors = true;
        });

        page.on('requestfailed', request => {
            console.log(`[REQUEST FAILED] ${request.url()} - ${request.failure().errorText}`);
            hasErrors = true;
        });

        page.on('response', response => {
            const status = response.status();
            if (!response.ok() && status >= 400) {
                console.log(`[HTTP ERROR] ${response.url()} status ${status}`);
                hasErrors = true;
            }
        });

        try {
            await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
            console.log(`Finished loading ${url}`);
            
            // Interaction phase to uncover hidden JS bugs
            const clickableElements = await page.$$('button, .option-card, .nav-item, .sub-nav-item');
            for (const el of clickableElements) {
                try {
                    await el.evaluate(n => n.click());
                    await new Promise(r => setTimeout(r, 50)); // Allow time for sync JS errors
                } catch(e) {}
            }

            // Check for broken internal links
            const links = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('a[href]'))
                    .map(a => a.href)
                    .filter(href => href.startsWith('http://localhost:3000'));
            });
            
            for (const link of links) {
               if (!urls.includes(link)) {
                   // Optional: can do a light fetch check here
               }
            }
        } catch (e) {
            console.log(`[NAVIGATION ERROR] ${e.message}`);
            hasErrors = true;
        }
        await page.close();
    }
    await browser.close();
    console.log('\n--- Scan Completed ---');
})();
