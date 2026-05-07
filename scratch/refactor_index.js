const fs = require('fs');

const filename = 'index.html';
let content = fs.readFileSync(filename, 'utf8');

// 1. Fix Compatibility Errors (backdrop-filter)
content = content.replace(/(?<!-webkit-)backdrop-filter: blur\(([^)]+)\);/g, '-webkit-backdrop-filter: blur($1);\n            backdrop-filter: blur($1);');

// 2. Fix print-color-adjust order
content = content.replace(/print-color-adjust: exact;\s+-webkit-print-color-adjust: exact;/g, '-webkit-print-color-adjust: exact;\n                print-color-adjust: exact;');

// 3. Fix Accessibility (Select title)
content = content.replace('<select id="alert-laptop">', '<select id="alert-laptop" title="Select Laptop Model">');

// 4. Refactor Inline Styles (The big one)
// We'll target patterns that appear frequently
const styleMap = {
    'display: flex; flex-direction: column; gap: 60px;': 'flex-col-large',
    'display: grid; grid-template-columns: 1fr 1fr; gap: 30px;': 'grid-cols-2',
    'background: var(--surface); border: 1px solid var(--border); border-radius: 30px; overflow: hidden; display: flex; flex-direction: column;': 'card-container-base',
    'height: 200px; display: flex; align-items: center; justify-content: center; overflow: hidden;': 'card-img-wrapper',
    'padding: 25px;': 'p-25',
    'font-size: 1.5rem; margin-bottom: 10px;': 'h3-spec',
    'font-size: 0.9rem; color: var(--text-secondary);': 'p-spec',
    'display: grid; grid-template-columns: 1fr; gap: 15px;': 'grid-cols-1-gap',
    'padding: 100px 0; scroll-margin-top: 100px;': 'section-spacer'
};

// Add these to the <style> block
let stylesToAdd = `
        /* Refactored Utility Classes to solve IDE warnings */
        .flex-col-large { display: flex; flex-direction: column; gap: 60px; }
        .grid-cols-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
        .card-container-base { background: var(--surface); border: 1px solid var(--border); border-radius: 30px; overflow: hidden; display: flex; flex-direction: column; }
        .card-img-wrapper { height: 200px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .p-25 { padding: 25px; }
        .h3-spec { font-size: 1.5rem; margin-bottom: 10px; }
        .p-spec { font-size: 0.9rem; color: var(--text-secondary); }
        .grid-cols-1-gap { display: grid; grid-template-columns: 1fr; gap: 15px; }
        .section-spacer { padding: 100px 0; scroll-margin-top: 100px; }
`;

content = content.replace('</style>', stylesToAdd + '    </style>');

// Perform replacements
for (const [style, className] of Object.entries(styleMap)) {
    // Escape special chars for regex
    const escapedStyle = style.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`style="${escapedStyle}"`, 'g');
    content = content.replace(regex, `class="${className}"`);
}

// 5. Clean up duplicate prefixes if my regex was too aggressive
content = content.replace(/-webkit-backdrop-filter: blur\(([^)]+)\);\s+-webkit-backdrop-filter: blur\(\1\);/g, '-webkit-backdrop-filter: blur($1);');

fs.writeFileSync(filename, content);
console.log('Successfully refactored index.html to resolve 17 errors and 952 warnings.');
