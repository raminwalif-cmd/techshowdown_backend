const fs = require('fs');

function checkTags(filename) {
    const content = fs.readFileSync(filename, 'utf8');
    const stack = [];
    const reg = /<\/?([a-zA-Z1-6]+)(\s|>)/g;
    let match;
    const voidTags = ['img', 'br', 'hr', 'input', 'link', 'meta', 'source', 'line', 'circle', 'rect', 'path', 'ellipse', 'polygon', 'polyline', 'stop', 'defs', 'use', 'image'];

    console.log(`\nValidating tags for ${filename}...`);
    while ((match = reg.exec(content)) !== null) {
        const fullTag = match[0];
        const tagName = match[1].toLowerCase();
        const isClosing = fullTag.startsWith('</');

        if (voidTags.includes(tagName)) continue;

        if (isClosing) {
            if (stack.length === 0) {
                console.log(`[ERROR] Unexpected closing tag </${tagName}> at index ${match.index}`);
            } else {
                const last = stack.pop();
                if (last.name !== tagName) {
                    console.log(`[ERROR] Tag mismatch: <${last.name}> (at ${last.index}) closed by </${tagName}> (at ${match.index})`);
                }
            }
        } else {
            stack.push({ name: tagName, index: match.index });
        }
    }

    if (stack.length > 0) {
        stack.forEach(tag => {
            console.log(`[ERROR] Unclosed tag <${tag.name}> at index ${tag.index}`);
        });
    } else {
        console.log(`[OK] All tags balanced.`);
    }
}

['index.html', 'phones.html', 'guide.html'].forEach(checkTags);
