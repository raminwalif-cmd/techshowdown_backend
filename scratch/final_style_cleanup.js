const fs = require('fs');

function removeStyleBlocks(filename, patterns) {
    if (!fs.existsSync(filename)) return;
    let content = fs.readFileSync(filename, 'utf8');

    patterns.forEach(pattern => {
        content = content.replace(pattern, '');
    });

    // Special case for the spin-anim JS string
    content = content.replace(/<style>@keyframes spin-anim { 100% { transform: rotate\(360deg\); } } .spin-anim { animation: spin-anim 2s linear infinite; }<\/style>`/, '`');

    fs.writeFileSync(filename, content);
    console.log(`Cleaned up style blocks in ${filename}`);
}

const patterns = [
    /<style>\s*\.territory-btn[\s\S]*?<\/style>/,
    /<style>\s*@keyframes pulseRing[\s\S]*?<\/style>/,
    /<style>\s*\/\* Sentinel Advanced Export[\s\S]*?<\/style>/,
    /<!-- Apple-Style Scroll Transition Engine -->\s*<style>[\s\S]*?<\/style>/
];

removeStyleBlocks('index.html', patterns);
removeStyleBlocks('phones.html', patterns);
