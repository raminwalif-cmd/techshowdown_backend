const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    // Capture console logs
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    
    await page.goto('http://localhost:3000/laptops.html', { waitUntil: 'networkidle0' });
    
    // Evaluate elements
    const dimensions = await page.evaluate(() => {
        const engine = document.querySelector('.narrative-engine');
        const sticky = document.querySelector('.narrative-sticky-box');
        const scroll = document.querySelector('.narrative-scroll-container');
        const steps = document.querySelectorAll('.narrative-step');
        
        return {
            engineHeight: engine ? engine.offsetHeight : null,
            stickyHeight: sticky ? sticky.offsetHeight : null,
            scrollHeight: scroll ? scroll.offsetHeight : null,
            stepsCount: steps.length,
            step1Top: steps[0] ? steps[0].getBoundingClientRect().top : null,
            isActive: steps[0] ? steps[0].classList.contains('is-active') : false
        };
    });
    
    console.log(dimensions);
    
    await page.evaluate(() => window.scrollBy(0, document.querySelector('.narrative-engine').offsetTop + 500));
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'scratch/scrolly.png' });
    
    await browser.close();
})();
