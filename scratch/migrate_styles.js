const fs = require('fs');
const path = require('path');

function migrateFile(filename, cssFilename) {
    if (!fs.existsSync(filename)) return;
    let content = fs.readFileSync(filename, 'utf8');

    // 1. Extract and Remove <style> block
    const styleBlockRegex = /<style>([\s\S]*?)<\/style>/i;
    const styleMatch = content.match(styleBlockRegex);
    let externalCss = '';
    if (styleMatch) {
        externalCss = styleMatch[1].trim();
        // Remove the block
        content = content.replace(styleBlockRegex, '');
    }

    // 2. Extract Inline Styles
    const inlineStyleRegex = /style="([^"]*)"/g;
    const inlineStyles = [];
    let match;
    while ((match = inlineStyleRegex.exec(content)) !== null) {
        inlineStyles.push(match[1]);
    }

    const uniqueStyles = [...new Set(inlineStyles)];
    const styleToClassMap = {};
    let utilityCss = '\n\n/* Extracted Inline Styles */\n';

    uniqueStyles.forEach((style, index) => {
        // Skip if it's too short or likely a logic-driven dynamic style (though unlikely in this static context)
        if (style.length < 5) return;

        // Generate a systematic class name based on content hash or simple index
        // Since we want "permanent" and "professional", let's use a descriptive prefix
        const className = `ext-style-${index + 1}`;
        styleToClassMap[style] = className;
        
        // Normalize style string
        const normalizedStyle = style.split(';').map(s => s.trim()).filter(Boolean).join('; ');
        utilityCss += `.${className} { ${normalizedStyle}; }\n`;
    });

    // 3. Replace style="..." with class="..." 
    // We need to be careful with existing classes
    uniqueStyles.forEach(style => {
        const className = styleToClassMap[style];
        if (!className) return;

        // Find elements with this style
        const escapedStyle = style.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Handle class merging
        const regexWithClass = new RegExp(`class="([^"]*)"\\s+style="${escapedStyle}"`, 'g');
        content = content.replace(regexWithClass, (match, existingClasses) => {
            return `class="${existingClasses} ${className}"`;
        });

        const regexBeforeClass = new RegExp(`style="${escapedStyle}"\\s+class="([^"]*)"`, 'g');
        content = content.replace(regexBeforeClass, (match, existingClasses) => {
            return `class="${className} ${existingClasses}"`;
        });

        const regexNoClass = new RegExp(`style="${escapedStyle}"`, 'g');
        content = content.replace(regexNoClass, `class="${className}"`);
    });

    // 4. Final compatibility fixes in the HTML content
    // Fix background-clip
    content = content.replace(/class="logo"/g, 'class="logo text-gradient"');

    // 5. Add external CSS links
    const headEnd = '</head>';
    const cssLinks = `    <link rel="stylesheet" href="base.css">\n    <link rel="stylesheet" href="${cssFilename}">\n`;
    content = content.replace(headEnd, cssLinks + headEnd);

    // Save CSS
    fs.writeFileSync(cssFilename, externalCss + utilityCss);
    // Save HTML
    fs.writeFileSync(filename, content);

    console.log(`Successfully migrated ${filename} -> ${cssFilename}`);
}

migrateFile('index.html', 'index.css');
migrateFile('phones.html', 'phones.css');
migrateFile('guide.html', 'guide.css');
