const fs = require('fs');

function checkStyleDuplicates(filename) {
    const content = fs.readFileSync(filename, 'utf8');
    const styleAttrMatches = content.match(/style="([^"]*)"/g) || [];
    let issues = 0;

    styleAttrMatches.forEach(match => {
        const styleContent = match.match(/style="([^"]*)"/)[1];
        const props = styleContent.split(';').map(p => p.split(':')[0].trim()).filter(p => p);
        const counts = {};
        props.forEach(p => {
            counts[p] = (counts[p] || 0) + 1;
            if (counts[p] === 2) {
                issues++;
            }
        });
    });

    console.log(`${filename}: Found ${issues} duplicate properties in inline styles.`);
}

['index.html', 'phones.html', 'guide.html'].forEach(checkStyleDuplicates);
