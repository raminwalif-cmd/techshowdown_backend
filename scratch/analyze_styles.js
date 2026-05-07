const fs = require('fs');
const files = ['index.html', 'phones.html', 'guide.html'];

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    const content = fs.readFileSync(file, 'utf8');
    const styleMatches = content.match(/style="([^"]*)"/g) || [];
    
    console.log(`\nAnalysis of ${file}:`);
    console.log(`Total inline styles: ${styleMatches.length}`);
    
    const uniqueStyles = {};
    styleMatches.forEach(s => {
        const val = s.match(/style="([^"]*)"/)[1];
        uniqueStyles[val] = (uniqueStyles[val] || 0) + 1;
    });
    
    const sorted = Object.entries(uniqueStyles).sort((a, b) => b[1] - a[1]);
    console.log('Top 10 repeating styles:');
    sorted.slice(0, 10).forEach(([s, count]) => {
        console.log(`[${count} times]: ${s}`);
    });
});
