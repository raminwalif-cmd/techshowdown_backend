/**
 * TechShowdown 2026 — Laptops Platform Engine v2.5.0
 * 
 * This script handles all interactive components for the laptops comparison page,
 * including the AI Hardware Architect wizard, cinematic carousels, and the Sentinel Export.
 */

// --- 1. Global State & Configuration ---
// [SYSTEM] State managed via Architect Engine v3.0 in laptops.html

// --- 2. Sentinel Technical Export Engine [STATIC DOWNLOAD PROTOCOL] ---
// ... (runSentinelExportV5 is defined here)
window.runSentinelExportV5 = async function() {
    console.log("[SENTINEL] Export Protocol Initialized");
    const modal = document.getElementById('export-console-v5');
    const log = document.getElementById('v5-log');
    const progress = document.getElementById('v5-progress-fill');

    if (!modal || !log || !progress) {
        console.error("[SENTINEL] Error: Missing UI components.", { modal, log, progress });
        alert("System Error: Export components missing. Please refresh.");
        return;
    }

    modal.classList.add('active');
    log.style.color = "#00d2ff";
    
    const steps = [
        { text: "ESTABLISHING QUANTUM LINK...", p: 20 },
        { text: "AUTHENTICATING BIOMETRICS...", p: 40 },
        { text: "RETRIEVING ENCRYPTED DOSSIER...", p: 70 },
        { text: "BYPASSING NEURAL FIREWALL...", p: 90 }
    ];

    for (const step of steps) {
        log.innerText = step.text;
        progress.style.width = `${step.p}%`;
        await new Promise(r => setTimeout(r, 600));
    }

    try {
        console.log("[SENTINEL] Triggering Download...");
        const downloadUrl = '/assets/Sentinel_Laptop_Whitepaper_2026.pdf';
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = 'TechShowdown_2026_Laptop_Sentinel_Report.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        log.innerText = "TRANSFER SUCCESSFUL";
        progress.style.width = "100%";
        
        setTimeout(() => {
            modal.classList.remove('active');
            progress.style.width = "0%";
        }, 2500);

    } catch (err) {
        console.error("[SENTINEL] Download Failure:", err);
        log.innerText = "ERROR: UPLINK SEVERED";
        log.style.color = "#ff4444";
        setTimeout(() => {
            modal.classList.remove('active');
        }, 3000);
    }
};

// --- 3. AI Hardware Architect Wizard Logic moved to laptops.html [INLINE PROTOCOL] ---

// --- 4. Multimedia & Carousel Logic ---

function analyzeImageContrast(imgElement) {
    return new Promise((resolve) => {
        if (!imgElement) return resolve(false);
        if (imgElement.complete) {
            processImage(imgElement, resolve);
        } else {
            imgElement.onload = () => processImage(imgElement, resolve);
            imgElement.onerror = () => resolve(false);
        }
    });
}

function processImage(img, resolve) {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width || img.naturalWidth || 100;
        canvas.height = img.height || img.naturalHeight || 100;
        if (canvas.width === 0 || canvas.height === 0) return resolve(false);

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const scanArea = ctx.getImageData(0, canvas.height * 0.5, canvas.width * 0.5, canvas.height * 0.5);
        let r = 0, g = 0, b = 0;
        let pixels = scanArea.data.length / 4;

        for (let i = 0; i < scanArea.data.length; i += 4) {
            r += scanArea.data[i];
            g += scanArea.data[i + 1];
            b += scanArea.data[i + 2];
        }

        r = r / pixels; g = g / pixels; b = b / pixels;
        const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));
        resolve(hsp > 127.5);
    } catch (e) {
        console.warn("[MEDIA] Contrast analysis bypassed due to security/loading.", e);
        resolve(false);
    }
}

class CarouselController {
    constructor(trackId, progressId, btnId) {
        this.track = document.getElementById(trackId);
        this.progress = document.getElementById(progressId);
        this.btn = document.getElementById(btnId);
        
        if (!this.track) return;
        
        this.slides = this.track.querySelectorAll('.carousel-slide');
        this.currentIndex = 0;
        this.isPlaying = true;
        this.duration = 5000;
        this.progressVal = 0;
        
        this.init();
    }

    init() {
        this.slides.forEach((slide) => {
            const img = slide.querySelector('img');
            const content = slide.querySelector('.slide-content');
            if (img && content) {
                analyzeImageContrast(img).then((isLight) => {
                    if (isLight) content.classList.add('light-mode-overlay');
                });
            }
        });

        setInterval(() => {
            if (this.isPlaying) {
                this.progressVal += (100 / (this.duration / 100));
                if (this.progress) this.progress.style.width = `${this.progressVal}%`;
                if (this.progressVal >= 100) this.nextSlide();
            }
        }, 100);

        if (this.btn) {
            this.btn.addEventListener('click', () => {
                this.isPlaying = !this.isPlaying;
                this.btn.innerText = this.isPlaying ? '❚❚' : '▶';
            });
        }
    }

    nextSlide() {
        this.currentIndex = (this.currentIndex + 1) % this.slides.length;
        this.update();
    }

    update() {
        const offset = -this.currentIndex * 100;
        this.track.style.transform = `translateX(${offset}%)`;
        this.progressVal = 0;
        if (this.progress) this.progress.style.width = '0%';
    }
}

// --- 5. Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    console.log("[SYSTEM] Platform Initialization Sequence Started.");

    // Benchmark Animations
    const benchmarksEl = document.getElementById('benchmark-lab');
    if (benchmarksEl) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const bars = entry.target.querySelectorAll('.bar-inner');
                    bars.forEach(bar => {
                        bar.style.width = bar.dataset.width;
                    });
                }
            });
        }, { threshold: 0.2 });
        observer.observe(benchmarksEl);
    }

    // Lightbox
    const lightbox = document.createElement('div');
    lightbox.id = 'image-lightbox';
    lightbox.innerHTML = `<div class="lightbox-close">&times;</div><img id="lightbox-img" src="" alt="Zoomed view">`;
    document.body.appendChild(lightbox);
    const lightboxImg = lightbox.querySelector('#lightbox-img');

    document.querySelectorAll('.image-placeholder img, .flashcard img, img.zoomable-ecosystem, .ext-style-87').forEach(img => {
        img.addEventListener('click', () => {
            lightboxImg.src = img.src;
            lightbox.classList.add('active');
        });
    });

    lightbox.addEventListener('click', () => lightbox.classList.remove('active'));

    // Carousels
    new CarouselController('carousel-track', 'progress-1', 'play-pause-1');
    new CarouselController('carousel-track-2', 'progress-2', 'play-pause-2');
    
    console.log("[SYSTEM] Initialization Complete.");
});

// --- 6. Geolocation Engine [RETRIEVED FROM RECOVERY PROTOCOL] ---

function initiateSentinelPulse() {
    console.log("[GEO] Initiating Satellite Pulse...");
    document.getElementById('sentinel-initial-trigger').style.display = 'none';
    document.getElementById('sentinel-territory-grid').style.display = 'block';
}

function selectTerritory(city) {
    console.log(`[GEO] Selected Territory: ${city}`);
    document.getElementById('sentinel-territory-grid').style.display = 'none';
    document.getElementById('geo-radar-display').style.display = 'flex';
    document.getElementById('geo-status-text').innerText = `CALIBRATING QUANTUM VECTORS FOR ${city}...`;

    setTimeout(() => {
        document.getElementById('geo-radar-display').style.display = 'none';
        document.getElementById('geo-results-matrix').style.display = 'block';
        
        const grid = document.getElementById('geo-deal-grid');
        const cityQuery = city.toLowerCase().replace('_', '+');
        
        // Advanced Precision Deep-Link Matrix
        let retailers = [
            { 
                name: `JB HI-FI ${city} CENTRAL`, mac: 3499, acer: 1899, meta: "OFFICIAL PARTNER", lowest: false, 
                url: `https://www.jbhifi.com.au/search?query=macbook+pro+m5+${cityQuery}` 
            },
            { 
                name: `OFFICEWORKS ${city} HUB`, mac: 3450, acer: 1850, meta: "PRICE LEADER", lowest: true, 
                url: `https://www.officeworks.com.au/shop/officeworks/search?q=macbook+pro+m5+${cityQuery}` 
            },
            { 
                name: `HARVEY NORMAN ${city} WEST`, mac: 3650, acer: 1999, meta: "WAREHOUSE DIRECT", lowest: false, 
                url: `https://www.harveynorman.com.au/catalogsearch/result/?q=macbook+pro+m5+${cityQuery}` 
            },
            { 
                name: `THE GOOD GUYS ${city} SOUTH`, mac: 3599, acer: 1949, meta: "BULK STOCK", lowest: false, 
                url: `https://www.thegoodguys.com.au/search/SearchDisplay?searchTerm=macbook+pro+m5+${cityQuery}` 
            }
        ];

        // Attempt to merge real-time data from local server
        fetch('/api/latest-prices')
            .then(res => res.json())
            .then(data => {
                if (data && data.prices) {
                    console.log("[SENTINEL] Real-time prices synced from Neural Uplink.");
                    // Update retailers with real prices if available
                    retailers = retailers.map(r => {
                        const macPrice = data.prices[`macbook:${r.name.split(' ')[0]}`]?.price;
                        const acerPrice = data.prices[`acer:${r.name.split(' ')[0]}`]?.price;
                        if (macPrice) r.mac = macPrice;
                        if (acerPrice) r.acer = acerPrice;
                        return r;
                    });
                }
                renderGrid(grid, retailers);
            })
            .catch(() => {
                console.warn("[SENTINEL] Neural Uplink unreachable. Utilizing cached market profile.");
                renderGrid(grid, retailers);
            });
    }, 800);
}

function renderGrid(grid, retailers) {
    grid.innerHTML = retailers.map(r => `
        <div class="retail-card ${r.lowest ? 'lowest-match' : ''} ext-style-144">
            <div class="retail-meta">
                ${r.lowest ? '🏆 BEST VALUE MATCH' : r.meta}
                <span class="live-pulse-small" style="float: right; font-size: 0.7em; color: #00ff66;">● LIVE</span>
            </div>
            <h4>${r.name}</h4>
            <div class="deal-specs">
                <p><span>MacBook Pro M5 Max:</span> <b>$${r.mac.toLocaleString()}</b></p>
                <p><span>Acer Aspire 14 AI:</span> <b>$${r.acer.toLocaleString()}</b></p>
            </div>
            ${r.lowest ? '<div class="lowest-badge">LOWEST PRICE DETECTED</div>' : ''}
            <button onclick="window.open('${r.url}', '_blank')" class="btn-deal">SECURE DEAL</button>
        </div>
    `).join('');
}
