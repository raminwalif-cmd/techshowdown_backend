const fs = require('fs');

function addAccessibility(filename) {
    if (!fs.existsSync(filename)) return;
    let content = fs.readFileSync(filename, 'utf8');

    // Add aria-label to carousel buttons
    content = content.replace(/class="btn-carousel" onclick="carousel(\d)\.prevSlide\(\)">←<\/button>/g, 'class="btn-carousel" onclick="carousel$1.prevSlide()" aria-label="Previous Slide">←</button>');
    content = content.replace(/class="btn-carousel" onclick="carousel(\d)\.nextSlide\(\)">→<\/button>/g, 'class="btn-carousel" onclick="carousel$1.nextSlide()" aria-label="Next Slide">→</button>');
    content = content.replace(/class="btn-carousel" id="play-pause-(\d)" onclick="carousel\d\.togglePlay\(\)">❚❚<\/button>/g, 'class="btn-carousel" id="play-pause-$1" onclick="carousel$1.togglePlay()" aria-label="Toggle Auto-Play Play/Pause">❚❚</button>');

    // Add title to territory buttons
    content = content.replace(/class="territory-btn( metro)?" onclick="selectTerritory\('(.+?)'\)">(.*?)<\/button>/g, (match, metro, id, label) => {
        return `class="territory-btn${metro || ''}" onclick="selectTerritory('${id}')" title="Select Territory: ${label}" aria-label="Select Territory: ${label}">${label}</button>`;
    });

    // Add aria-label to Sentinel elements
    content = content.replace(/class="sentinel-export-btn" id="sentinel-hub-export-trigger"/g, 'class="sentinel-export-btn" id="sentinel-hub-export-trigger" aria-label="Export Advanced Technical Report" title="Export Technical Report"');

    // Add aria-label to "Back to Top" (if I find it)
    content = content.replace(/class="back-to-top"(.*?)>/g, 'class="back-to-top"$1 aria-label="Scroll back to top" title="Back to Top">');

    fs.writeFileSync(filename, content);
    console.log(`Enhanced accessibility in ${filename}`);
}

addAccessibility('index.html');
addAccessibility('phones.html');
addAccessibility('guide.html');
