const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  let errors = [];
  let warnings = [];

  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
    if (msg.type() === 'warning') warnings.push(msg.text());
  });

  page.on('pageerror', err => {
    errors.push(err.toString());
  });

  console.log('Testing index.html...');
  await page.goto('http://localhost:3000/index.html');
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('Testing phones.html...');
  await page.goto('http://localhost:3000/phones.html');
  await new Promise(r => setTimeout(r, 2000));

  console.log('Testing guide.html...');
  await page.goto('http://localhost:3000/guide.html');
  await new Promise(r => setTimeout(r, 2000));

  console.log(`\n--- Console Diagnostics ---`);
  console.log(`Total Runtime Errors: ${errors.length}`);
  console.log(`Total Runtime Warnings: ${warnings.length}`);
  
  if (errors.length > 0) {
    console.log('\nSample Errors:');
    errors.slice(0, 10).forEach(e => console.log(' - ' + e));
  }

  await browser.close();
})();
