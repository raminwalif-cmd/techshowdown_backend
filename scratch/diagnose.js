const fs = require('fs');
const content = fs.readFileSync('/usr/games/laptop-comparison/phones_scripts.js', 'utf8');
try {
    new Function(content);
    console.log("Syntax OK");
} catch (e) {
    console.log("Syntax Error:", e.message);
    console.log("Stack:", e.stack);
}
