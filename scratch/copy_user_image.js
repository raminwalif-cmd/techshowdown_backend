const fs = require('fs');
const path = require('path');

const src = '/home/raminwalif/.gemini/antigravity/brain/a8519574-f7aa-48be-a3ca-42be4bbbab3e/macbook_hero_side_profile_1775741632896.png';
const dst = '/usr/games/laptop-comparison/assets/macbook_user_side.png';

try {
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dst);
        console.log('SUCCESS: Copied', src, 'to', dst);
    } else {
        console.log('ERROR: Source file does not exist at', src);
        // Try to find any other images in that folder
        const dir = path.dirname(src);
        if (fs.existsSync(dir)) {
            const files = fs.readdirSync(dir);
            console.log('Files in directory:', files);
        } else {
            console.log('Directory does not exist:', dir);
        }
    }
} catch (err) {
    console.error('An error occurred:', err);
}
