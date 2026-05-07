const fs = require('fs');

function addSvgAria(filename) {
    if (!fs.existsSync(filename)) return;
    let content = fs.readFileSync(filename, 'utf8');

    // Simple replacement for SVGs missing accessibility
    // We'll target <svg that doesn't have aria-label
    content = content.replace(/<svg(?![^>]*aria-label)([^>]*)>/g, (match, p1) => {
        // Find if it has a class or parent that gives context
        // For simplicity, we'll add a generic role="img" and aria-label="Icon"
        // or try to be slightly smarter if possible.
        return `<svg role="img" aria-label="Icon" ${p1}>`;
    });

    fs.writeFileSync(filename, content);
    console.log(`Added accessibility to SVGs in ${filename}`);
}

addSvgAria('index.html');
addSvgAria('phones.html');
addSvgAria('guide.html');
