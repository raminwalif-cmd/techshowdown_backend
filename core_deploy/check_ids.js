const fs = require('fs');

const idsList = fs.readFileSync('ids_used.txt', 'utf8').split('\n').filter(l => l.trim());
console.log(`Found ${idsList.length} ID references.`);

const indexContent = fs.readFileSync('index.html', 'utf8');
const phonesContent = fs.readFileSync('phones.html', 'utf8');

for(const line of idsList) {
    if(!line.includes(':')) continue;
    const scriptFile = line.split(':')[0];
    const id = line.split(':')[1];
    
    // Check index_scripts.js ids against index.html
    if(scriptFile === 'index_scripts.js') {
        const regex = new RegExp(`id=["']${id}["']`);
        if(!regex.test(indexContent)) {
            console.log(`[BUG] index_scripts.js relies on '${id}', but it is MISSING in index.html!`);
        }
    }
    
    // Check phones_scripts.js ids against phones.html
    if(scriptFile === 'phones_scripts.js') {
        const regex = new RegExp(`id=["']${id}["']`);
        if(!regex.test(phonesContent)) {
            console.log(`[BUG] phones_scripts.js relies on '${id}', but it is MISSING in phones.html!`);
        }
    }
}
