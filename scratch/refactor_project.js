const fs = require('fs');

const files = ['index.html', 'phones.html', 'guide.html'];

const styleMap = {
    'display: flex; flex-direction: column; gap: 60px;': 'flex-col-large',
    'display: grid; grid-template-columns: 1fr 1fr; gap: 30px;': 'grid-cols-2',
    'background: var(--surface); border: 1px solid var(--border); border-radius: 30px; overflow: hidden; display: flex; flex-direction: column;': 'card-container-base',
    'height: 200px; display: flex; align-items: center; justify-content: center; overflow: hidden;': 'card-img-wrapper',
    'padding: 25px;': 'p-25',
    'font-size: 1.5rem; margin-bottom: 10px;': 'h3-spec',
    'font-size: 0.9rem; color: var(--text-secondary);': 'p-spec',
    'display: grid; grid-template-columns: 1fr; gap: 15px;': 'grid-cols-1-gap',
    'padding: 100px 0; scroll-margin-top: 100px;': 'section-spacer',
    'color:#fff;': 'text-white',
    'margin-bottom: 18px;': 'mb-18',
    'padding: 20px;': 'p-20',
    'width: 100%; height: 100%; object-fit: cover;': 'img-fit-cover',
    'scroll-margin-top: 100px;': 'scroll-mt-100',
    'text-align: right;': 'text-right',
    'font-weight: 700;': 'font-bold'
};

const stylesToAdd = `
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
        .text-white { color: #fff; }
        .mb-18 { margin-bottom: 18px; }
        .p-20 { padding: 20px; }
        .img-fit-cover { width: 100%; height: 100%; object-fit: cover; }
        .scroll-mt-100 { scroll-margin-top: 100px; }
        .text-right { text-align: right; }
        .font-bold { font-weight: 700; }
`;

files.forEach(filename => {
    if (!fs.existsSync(filename)) return;
    let content = fs.readFileSync(filename, 'utf8');

    // Add Styles if not already present
    if (!content.includes('Refactored Utility Classes')) {
        content = content.replace('</style>', stylesToAdd + '    </style>');
    }

    // Fix Compatibility Errors (backdrop-filter)
    content = content.replace(/(?<!-webkit-)backdrop-filter: blur\(([^)]+)\);/g, '-webkit-backdrop-filter: blur($1);\n            backdrop-filter: blur($1);');

    // Fix print-color-adjust order
    content = content.replace(/print-color-adjust: exact;\s+-webkit-print-color-adjust: exact;/g, '-webkit-print-color-adjust: exact;\n                print-color-adjust: exact;');

    // Perform replacements
    for (const [style, className] of Object.entries(styleMap)) {
        const escapedStyle = style.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`style="${escapedStyle}"`, 'g');
        content = content.replace(regex, `class="${className}"`);
    }

    // Clean up duplicate prefixes
    content = content.replace(/-webkit-backdrop-filter: blur\(([^)]+)\);\s+-webkit-backdrop-filter: blur\(\1\);/g, '-webkit-backdrop-filter: blur($1);');

    fs.writeFileSync(filename, content);
    console.log(`Successfully refactored ${filename}`);
});
