const fs = require('fs');

function cleanupCss(filename) {
    if (!fs.existsSync(filename)) return;
    let content = fs.readFileSync(filename, 'utf8');

    // Remove redundant global blocks that are now in base.css
    const redundantBlocks = [
        /:root\s*{[\s\S]*?}/g,
        /\*\s*{[\s\S]*?}/g,
        /body\s*{[\s\S]*?}/g,
        /\.container\s*{[\s\S]*?}/g
    ];

    redundantBlocks.forEach(regex => {
        content = content.replace(regex, '');
    });

    // Fix backdrop-filter prefixes
    content = content.replace(/(?<!-webkit-)backdrop-filter: blur\(([^)]+)\);/g, '-webkit-backdrop-filter: blur($1);\n    backdrop-filter: blur($1);');
    
    // Fix background-clip (notably for .logo if it's there)
    content = content.replace(/-webkit-background-clip: text;/g, '-webkit-background-clip: text;\n    background-clip: text;');

    // Standardize spacing
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

    fs.writeFileSync(filename, content.trim() + '\n');
    console.log(`Cleaned up ${filename}`);
}

cleanupCss('index.css');
cleanupCss('phones.css');
cleanupCss('guide.css');
