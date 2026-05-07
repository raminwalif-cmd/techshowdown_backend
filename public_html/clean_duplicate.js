const fs = require('fs');

function cleanHTML(file) {
    let content = fs.readFileSync(file, 'utf8');
    const start = content.indexOf('<div style="position: fixed; bottom: 100px; left: 40px; z-index: 1000;">');
    if (start !== -1) {
        const endStr = '📄 Export Whitepaper\n        </button>\n    </div>\n';
        const end = content.indexOf(endStr, start);
        if (end !== -1) {
            content = content.substring(0, start) + content.substring(end + endStr.length);
            fs.writeFileSync(file, content);
            console.log(`Cleaned HTML: ${file}`);
        }
    }
}

function cleanJS(file) {
    let content = fs.readFileSync(file, 'utf8');
    const startRegex = /\/\/\s*Client-Side PDF Generation Engine[^\n]*\n\s*window\.generateClientPdf\s*=\s*async function\(\)\s*\{/;
    const match = content.match(startRegex);
    
    if (match) {
        let braceCount = 0;
        let startIndex = match.index;
        let inFunction = false;
        let endIndex = -1;
        
        for (let i = startIndex; i < content.length; i++) {
            if (content[i] === '{') {
                braceCount++;
                inFunction = true;
            } else if (content[i] === '}') {
                braceCount--;
            }
            
            if (inFunction && braceCount === 0) {
                if (content[i+1] === ';') {
                    endIndex = i + 2;
                } else {
                    endIndex = i + 1;
                }
                break;
            }
        }
        
        if (endIndex !== -1) {
            content = content.substring(0, startIndex) + content.substring(endIndex);
            fs.writeFileSync(file, content);
            console.log(`Cleaned JS: ${file}`);
        }
    }
}

cleanHTML('index.html');
cleanHTML('phones.html');
cleanJS('index_scripts.js');
cleanJS('phones_scripts.js');
