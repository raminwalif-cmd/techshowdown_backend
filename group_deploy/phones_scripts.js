/**
 * TechShowdown 2026 - Consolidated Platform Logic v3.0
 * Merges search, architect, sentinel, carousels, and animations.
 */

(function() {
    "use strict";

    // --- Knowledge Base & Semantic Engine ---
    const knowledgeBase = {
        subjects: {
            iphone: {
                keywords: ['iphone', 'apple', '17', 'pro max', 'ios', 'a19', 'titanium', 'tetraprism', '2nm', 'g19'],
                label: 'iPhone 17 Pro Max'
            },
            galaxy: {
                keywords: ['galaxy', 's25', 'samsung', 'android', 'ultra', 'snapdragon', 's-pen', 'spen', 'isocell', 'hp4', 'gen 4'],
                label: 'Galaxy S25 Ultra'
            },
            comparison: {
                keywords: ['both', 'compare', 'comparison', 'vs', 'against', 'better', 'choose', 'choice', 'winner', 'recommend', 'showdown', 'which one'],
                label: 'The Showdown'
            }
        },
        intents: {
            price: {
                keywords: ['price', 'cost', 'how much', 'buy', 'cheap', 'expensive', 'dollar', 'aud', 'retail', 'value', 'sale', 'deals', 'trade-in', 'carrier'],
                responses: {
                    iphone: "The <b>iPhone 17 Pro Max</b> base model (256GB) is currently listed at <b>$2,199 AUD</b>. Apple's pricing remains rigid, though <b>Carrier Subsidies</b> (Optus/Telstra) significantly reduce the upfront cost over 36-month Neural-Plans. It holds a 75% resale value after 12 months.",
                    galaxy: "Samsung's <b>Galaxy S25 Ultra</b> officially retails for <b>$2,049 AUD</b>. However, Samsung's 2026 'Nexus Trade-in' program often reduces this by <b>$600+</b> when trading in a previous Ultra device. It is effectively the better value proposition if you are within the Samsung ecosystem.",
                    comparison: "In raw dollars, the <b>Galaxy ($2,049)</b> is $150 cheaper than the <b>iPhone ($2,199)</b>. However, the iPhone's low depreciation often makes it the 'cheaper' device over a 2-year ownership cycle when accounting for trade-in equity."
                }
            },
            performance: {
                keywords: ['performance', 'fast', 'speed', 'benchmarks', 'processor', 'chip', 'gpu', 'geekbench', 'antutu', 'fps', 'game', 'gaming', 'thermal', 'ram'],
                responses: {
                    iphone: "The <b>A19 Pro (2nm GAA)</b> is a silicon marvel. It achieves a <b>Geekbench 7 Single-Core score of 4,200</b>. It feature 12GB of high-bandwidth LPDDR6 RAM, specifically tuned for the 'G19' Neural OS kernel. It is the most consistent mobile chip ever manufactured.",
                    galaxy: "Powering the Galaxy is the <b>Snapdragon 8 Gen 4</b>. It wins on raw GPU throughput, scoring <b>1,250,000 in AnTuTu 11</b>. With 16GB of RAM as standard, it is a multi-tasking workstation, allowing for a desktop-class DeX 4.0 experience without thermal throttling.",
                    comparison: "The **iPhone** is the 'Single-Core' king (Apps open faster, UI is smoother), while the **Galaxy** is the 'Multi-Threaded' beast (Better for heavy multi-tasking and desktop emulation). Both run AAA games like *Cyberpunk 2077 Mobile* at a locked 60FPS."
                }
            },
            camera: {
                keywords: ['camera', 'photo', 'video', 'lens', 'zoom', 'megapixels', 'shoot', 'pictures', 'prores', 'log', 'tetraprism', 'aperture', 'sensor'],
                responses: {
                    iphone: "Apple utilizes a <b>48MP Tetraprism Array</b> with a primary f/1.4 aperture. The 2026 upgrade focus was <b>Real-time Generative Lighting</b>, allowing the device to relight a scene during capture. It remains the gold standard for ProRes Log video (10-bit 4K/120).",
                    galaxy: "The <b>200MP ISOCELL HP4</b> sensor remains unparalleled for detail. Samsung's 'Space Zoom' has been upgraded to <b>100x AI-Reconstruction</b>, which use a local diffusion model to 'fill' missing data in ultra-long-range shots. Its astrophotography mode is industry-leading.",
                    comparison: "Choose the **iPhone** if you are a content creator focused on cinematic video and color grading. Choose the **Galaxy** if you need the world's most versatile zoom lens and high-resolution 200MP raw files for cropping."
                }
            },
            display: {
                keywords: ['display', 'screen', 'oled', 'amoled', 'nits', 'brightness', 'refresh', 'hz', 'resolution', 'glass', 'armor', 'glare', 'reflection'],
                responses: {
                    iphone: "The <b>LTPO 3.0 ProMotion</b> display sustains an incredible <b>3,500 nits</b> of peak outdoor brightness. Apple's <b>Ceramic Shield 2.0</b> uses crystalline dispersion for better impact protection, though it remains prone to mirror-like reflections in direct sun.",
                    galaxy: "The <b>Dynamic AMOLED 3X</b> uses <b>Gorilla Armor 2</b>. This is the Galaxy's winning feature—an anti-reflective nano-layer that eliminates 75% of ambient reflections. Despite it's lower 3,000 nit peak, it is often more legible than the iPhone in harsh sunlight.",
                    comparison: "The **iPhone** is technically brighter (3500 vs 3000 nits), but the **Galaxy** wins on clarity. The reflection-free coating on the S25 Ultra makes the colors 'pop' more in real-world environments compared to the glossy iPhone surface."
                }
            },
            ai: {
                keywords: ['ai', 'intelligence', 'generative', 'neural', 'smart', 'apple intelligence', 'galaxy ai', 'siri', 'gemini', 'translate', 'nanano'],
                responses: {
                    iphone: "<b>Apple Intelligence (2026)</b> runs on a Private Cloud Compute architecture. It features a local 7B parameter LLM optimized for 'Personal Context'—it knows your schedule, your tone, and your relationships without ever sending raw data to a server.",
                    galaxy: "<b>Galaxy AI 3.0 (Powered by Gemini Nano 2)</b> is a 'Action-Based' AI. It can proactively edit photos, draft emails based on simple voice commands, and perform two-way Live Translation for 50+ languages during voice and video calls.",
                    comparison: "Apple's AI is <b>Passive and Private</b> (Wait for you to ask); Samsung's AI is <b>Proactive and Powerful</b> (Suggests actions before you ask). Both are integrated deep into the kernel levels of their respective OS."
                }
            },
            design: {
                keywords: ['weight', 'heavy', 'light', 'portable', 'kg', 'build', 'material', 'titanium', 'armor', 'chassis', 'metal', 'hand', 'ergonomics'],
                responses: {
                    iphone: "Forged from <b>GAA Grade 5 Titanium</b>, the iPhone 17 Pro Max weighs <b>221g</b>. Its edges are 'Contour-Cut' to 2.5D, making it feel significantly smaller in the hand than previous 6.7-inch models.",
                    galaxy: "The Galaxy is a larger <b>232g</b> 'Slab'. It uses a <b>Titanium-Scandium alloy</b> for maximum rigidity. While more 'industrial' and square, it houses the internal S-Pen and a massive vapor chamber for sustained gaming cooling.",
                    comparison: "The **iPhone** is the choice for ergonomics and comfort. The **Galaxy** is the choice for utility—if you want an internal pen and the largest possible screen area for productivity, the extra 11g of weight is a small price to pay."
                }
            },
            stylus: {
                keywords: ['pen', 'spen', 's-pen', 'writing', 'draw', 'notes', 'stylus'],
                responses: {
                    iphone: "Apple continues to resist iPhone stylus support, prioritizing a <b>Phase-Synced 0.02ms haptic layer</b> that responds to touch with variable resistance, mimicking certain pen-like actions through the taptic engine.",
                    galaxy: "The <b>S-Pen</b> is the Ultra's defining tool. With <b>0.8ms latency</b> and 4,096 levels of pressure, it is essentially a Wacom tablet in your pocket. It is indispensable for professional document markup and remote camera triggering.",
                    comparison: "There is no competition here. If you use a stylus, the <b>Galaxy S25 Ultra</b> is the only flagship phone that exists. The iPhone is a pure-touch device."
                }
            },
            gaming: {
                keywords: ['gaming', 'games', 'play', 'fps', 'gpu', 'graphics', 'controller', 'ray tracing'],
                responses: {
                    iphone: "The A19 Pro features a new **Neural-Ray-Tracing core**. It runs *Resident Evil Village* at a locked 60FPS with full lighting effects. Heat dissipation is handled by a new graphene-interlayer.",
                    galaxy: "The Galaxy S25 Ultra is the king of mobile gaming. Its **Snapdragon 8 Gen 4** GPU is 20% faster than the iPhone's peak graphics output. It includes a massive vapor chamber to keep the phone cool during multi-hour sessions.",
                    comparison: "The **Galaxy** wins on raw peak graphics power and cooling. The **iPhone** wins on access to exclusive 'Console-Class' ports in the App Store."
                }
            }
        },
        general: {
            joke: {
                keywords: ['eat', 'food', 'edible', 'smash', 'break', 'water', 'lake', 'pool', 'stupid', 'dumb', 'joke'],
                response: "<b>NEURAL ADVISORY:</b> Detecting a non-technical inquiry logic loop. While 'Apple' is in the name, my data confirms the iPhone is not a fruit. Please do not consume your hardware!"
            },
            software: {
                keywords: ['os', 'ios', 'android', 'software', 'ecosystem', 'sequoia', 'apps', 'privacy', 'security', 'windows'],
                response: "The 2026 landscape is <b>iOS 19</b> vs <b>Android 16</b>. iOS wins on its 'Atomic Handshake'—if you have a Mac or iPad, it is one single entity. Android wins on its 'Open-Core' philosophy—allowing users to install custom technical kernels and desktop-class shells like DeX."
            }
        }
    };

    function BrainScan() {
        const context = {
            specs: [],
            benchmarks: [],
            retailers: [],
            rawText: document.body.innerText.replace(/\n/g, ' ').substring(0, 15000)
        };

        document.querySelectorAll('.spec-card').forEach(card => {
            const label = card.querySelector('label')?.innerText;
            const value = card.querySelector('span')?.innerText;
            if (label && value) context.specs.push(`${label}: ${value}`);
        });

        document.querySelectorAll('.chart-label span').forEach(label => {
            const row = label.closest('.chart-row');
            if (row) {
                const bars = row.querySelectorAll('.bar-wrapper');
                bars.forEach(bar => {
                    const name = bar.querySelector('.bar-name')?.innerText;
                    const pct = bar.querySelector('.percentage')?.innerText;
                    if (name && pct) context.benchmarks.push(`${label.innerText} - ${name}: ${pct}`);
                });
            }
        });

        document.querySelectorAll('.retailer-deal-card').forEach(card => {
            const name = card.querySelector('.deal-card-title')?.innerText || card.querySelector('h4')?.innerText;
            const price = card.querySelector('.price-badge')?.innerText;
            const status = card.querySelector('.status-badge')?.innerText;
            if (name && price) context.retailers.push(`${name} (${status}): ${price}`);
        });

        return context;
    }

    window.executeNeuralSearch = async function(query) {
        const aiBox = document.getElementById('ai-response-box');
        const aiText = document.getElementById('ai-text');
        const lowerQuery = query.toLowerCase().replace(/[?.,!]/g, '');
        const queryTerms = lowerQuery.split(/\s+/).filter(t => t.length > 2);
        const localContext = BrainScan();
        
        const localHits = [];
        function getScore(text) {
            let score = 0;
            const lowerText = text.toLowerCase();
            queryTerms.forEach(term => { if (lowerText.includes(term)) score += 5; });
            return score;
        }

        let bestIntentResponse = null;
        let highestIntentScore = 0;
        for (const [id, data] of Object.entries(knowledgeBase.intents)) {
            let score = 0;
            data.keywords.forEach(kw => {
                if (lowerQuery.includes(kw)) score += 10;
                queryTerms.forEach(qt => { if (kw.includes(qt)) score += 2; });
            });
            if (score > highestIntentScore) {
                highestIntentScore = score;
                let subject = "comparison";
                if (lowerQuery.includes('iphone') || lowerQuery.includes('apple')) subject = "iphone";
                if (lowerQuery.includes('galaxy') || lowerQuery.includes('samsung')) {
                    subject = (subject === "iphone") ? "comparison" : "galaxy";
                }
                bestIntentResponse = data.responses[subject];
            }
        }

        localContext.specs.forEach(s => { if (getScore(s) > 0) localHits.push(s); });
        localContext.benchmarks.forEach(b => { if (getScore(b) > 0) localHits.push(b); });
        localContext.retailers.forEach(r => { if (getScore(r) > 0) localHits.push(r); });

        aiBox.classList.add('active');
        aiText.innerHTML = `<div class="ext-style-187">
            <svg role="img" aria-label="Icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin-anim"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg>
            <span class="ext-style-188" id="research-status">Analyzing Technical Intent...</span>
        </div>`;

        const statusText = document.getElementById('research-status');
        await new Promise(r => setTimeout(r, 600));

        if (highestIntentScore > 5 || localHits.length > 0) {
            statusText.innerText = "Synthesizing Professional Technical Brief...";
            await new Promise(r => setTimeout(r, 800));
            
            let combinedResponse = "";
            if (bestIntentResponse) {
                combinedResponse += `### ✦ ARCHITECTURAL ADVISORY\n${bestIntentResponse}\n\n`;
            }
            if (localHits.length > 0) {
                const primaryHit = localHits[0];
                const secondaryHits = localHits.slice(1);
                combinedResponse += `### 📍 MOBILE ARCHITECTURAL CAPTURE\nFollowing a multi-layered scan of the mobile architectural nexus, our Research Engine has successfully synthesized a series of empirical data points from the active session. \n\n**PRIMARY HARDWARE LOGISTICS:** We have validated the persistent presence of **${primaryHit}** within the current technical context. \n\n**SUPPLEMENTARY METRICS:** Extensive secondary scanning confirms that ${secondaryHits.length > 0 ? secondaryHits.join('; furthermore, we have cross-referenced and authenticated ') : 'all auxiliary mobile parameters are operating within standard 2026 flagship envelopes'}. These findings provide the foundational data for our high-fidelity mobile research reports.\n\n`;
            }

            streamGeminiTokens(aiText, combinedResponse);
            return;
        }

        statusText.innerText = "Querying Global Research Nexus...";
        await new Promise(r => setTimeout(r, 1000));

        try {
            const res = await fetch(`/api/research?q=${encodeURIComponent(query)}`);
            const result = await res.json();
            if (result.success) {
                statusText.innerText = "Architecting Technical Report...";
                await new Promise(r => setTimeout(r, 800));
                streamGeminiTokens(aiText, result.data);
            } else {
                throw new Error("Confidence Threshold Not Met");
            }
        } catch (err) {
            statusText.innerText = "Opening Neural Gateway to Google...";
            await new Promise(r => setTimeout(r, 1000));
            simulateResearch(query);
        }
    };

    async function streamGeminiTokens(element, htmlContent) {
        element.innerHTML = `
            <div class="enterprise-report-header" style="border-left: 4px solid var(--accent-purple); padding-left: 20px; margin-bottom: 30px;">
                <div style="font-family: 'Outfit'; font-size: 0.7rem; color: var(--accent-purple); text-transform: uppercase; letter-spacing: 3px; font-weight: 800; margin-bottom: 5px;">
                    Intelligence Sequence: 2026.04.16-ALPHA
                </div>
                <div style="font-family: 'Outfit'; font-size: 1.5rem; font-weight: 800; color: #fff;">
                    Generating Mobile Architectural Dossier...
                </div>
            </div>
        `;

        const detailText = document.getElementById('thinking-detail');
        const thinkingSteps = [
            "Establishing Private Cloud Handshake...",
            "Synthesizing 2nm Semiconductor Logistics...",
            "Analyzing ISP Optical Throughput...",
            "Compiling Global Retailer Stock Matrices...",
            "Finalizing Mobile Technical Whitepaper..."
        ];

        if (detailText) {
            for (let i = 0; i < thinkingSteps.length; i++) {
                detailText.innerText = thinkingSteps[i];
                await new Promise(r => setTimeout(r, 600));
            }
        }

        element.innerHTML = `
            <div class="enterprise-dossier" style="background: transparent; color: #eee; font-family: 'Inter', sans-serif; line-height: 1.8; font-size: 1.05rem;">
                <div class="dossier-meta" style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 15px; margin-bottom: 30px; font-family: 'Outfit'; font-size: 0.75rem; color: #888; text-transform: uppercase; letter-spacing: 2px;">
                    <span>Status: Verified Mobile Index</span>
                    <span>Node ID: GRN-MOB-2026</span>
                </div>
                <div id="dossier-body"></div>
                <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 0.75rem; color: #666; text-align: center; font-style: italic;">
                    © 2026 GLOBAL RESEARCH NEXUS • MOBILE INTELLIGENCE UNIT
                </div>
            </div>
        `;

        const dossierBody = document.getElementById('dossier-body');
        if (dossierBody) {
            dossierBody.innerHTML = htmlContent;
            dossierBody.style.opacity = '0';
            dossierBody.style.transform = 'translateY(20px)';
            dossierBody.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
            void dossierBody.offsetWidth;
            dossierBody.style.opacity = '1';
            dossierBody.style.transform = 'translateY(0)';
        }
    }

    async function simulateResearch(query) {
        const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        const aiText = document.getElementById('ai-text');
        const fallbackResponse = `
            ### 🛰️ EXTERNAL RESEARCH ESCALATION BRIEF
            ---
            The inquiry regarding **"${query}"** has been classified as an high-complexity mobile architectural query that exceeds our internal 2026 local technical index. 
            
            To ensure the highest level of empirical accuracy, I have prepared a **Neural Gateway** to facilitate a deep-dive into the Global Google Intelligence Index.
            
            <div style="margin-top: 25px; text-align: center;">
                <a href="${googleUrl}" target="_blank" class="ext-style-213" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #4285F4, #34A853); color: white; text-decoration: none; border-radius: 12px; font-weight: 800; letter-spacing: 1px; box-shadow: 0 12px 24px rgba(66, 133, 244, 0.4); transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); text-transform: uppercase; font-size: 0.9rem;">Initiate Global Technical Deep-Dive</a>
            </div>
        `;
        streamGeminiTokens(aiText, fallbackResponse);
    }

    // --- AI Smartphone Architect ---
    let selections = { profile: [], priority: [], os: '', portability: '' };

    window.toggleOption = function(el, category, value) {
        el.classList.toggle('selected');
        if (selections[category].includes(value)) {
            selections[category] = selections[category].filter(v => v !== value);
        } else {
            selections[category].push(value);
        }
    };

    window.goToStep = function(step) {
        document.querySelectorAll('.step-content').forEach(s => s.classList.remove('active'));
        document.getElementById(`step-${step}`).classList.add('active');
    };

    window.selectOption = function(category, value) {
        selections[category] = value;
        let currentStep = category === 'os' ? 3 : 4;
        const nextStep = currentStep + 1;
        document.getElementById(`step-${currentStep}`).classList.remove('active');
        if (nextStep <= 4) {
            document.getElementById(`step-${nextStep}`).classList.add('active');
        } else {
            runFinalAnalysis();
        }
    };

    async function runFinalAnalysis() {
        document.getElementById('step-final').classList.add('active');
        const status = document.getElementById('recommender-status');
        const resultText = document.getElementById('recommender-result-text');
        const verifyContainer = document.getElementById('verify-link-container');

        await new Promise(r => setTimeout(r, 1500));
        status.innerText = "MAPPING NEURAL PROFILE...";
        await new Promise(r => setTimeout(r, 1500));
        status.innerText = "MATCH FOUND";

        let result = "";
        let googleQuery = "";

        const isPro = selections.profile.includes('pro');
        const isWorker = selections.profile.includes('worker');
        const isDev = selections.profile.includes('dev');
        const isGamer = selections.profile.includes('gaming');
        const isCreative = selections.profile.includes('creator');
        
        const needsZoom = selections.priority.includes('power');
        const needsVideo = selections.priority.includes('battery');
        const needsAI = selections.priority.includes('ai');
        const needsValue = selections.priority.includes('value');
        const needsSpeed = selections.priority.includes('speed');
        
        const os = selections.os;
        const aesthetics = selections.portability;

        if (os === 'macos') { // iOS Ecosystem
            if (isPro || needsVideo || aesthetics === 'desktop') {
                result = "The <b>iPhone 17 Pro Max</b> is your definitive target. Your ecosystem anchoring to iOS combined with Pro-tier requirements guarantees the A19 Pro provides the most frictionless experience.";
                googleQuery = "iPhone 17 Pro Max (2026) out of pocket price AU carriers";
            } else if (isWorker || aesthetics === 'balanced') {
                result = "The <b>iPhone 17 Pro</b> perfectly balances premium Titanium armor glass with a comfortable 6.1-inch form factor for all-day elite productivity.";
                googleQuery = "iPhone 17 Pro 2026 AU pricing";
            } else if (aesthetics === 'compact') {
                result = "The <b>iPhone 17 Air</b> is the ultra-thin, fashion-forward choice for those who value elegance and pocketability without sacrificing the iOS core.";
                googleQuery = "iPhone 17 Air 2026 release date Australia";
            } else {
                result = "The <b>iPhone 17</b> remains the ultimate point-and-shoot everyday companion wrapped in the secure Apple ecosystem.";
                googleQuery = "iPhone 17 base model 2026 Australia";
            }
        } else if (os === 'linux') { // Google Workspace / Stock Android
            if (isPro || isDev || needsAI) {
                result = "Since you live in Google Workspace and demand top-tier AI capabilities, the <b>Google Pixel 10 Pro XL</b> with the Tensor G5 is your perfect generative hardware.";
                googleQuery = "Google Pixel 10 Pro XL Tensor G5 AU";
            } else if (needsValue || aesthetics === 'compact') {
                result = "The <b>Google Pixel 10a</b> provides the smartest AI-driven software experience at a price point that challenges every other mid-range flagship.";
                googleQuery = "Google Pixel 10a price Australia 2026";
            } else {
                result = "For a pure, bloatware-free connection to Google services, the <b>Google Pixel 10</b> is unmatched.";
                googleQuery = "Google Pixel 10 2026 release price AU";
            }
        } else { // Android / Power User / Agnostic
            if (isGamer || (needsSpeed && isDev)) {
                result = "The <b>ASUS ROG Phone 10</b> is your weapon of choice. With its dedicated AirTrigger system and massive cooling, it is the only phone that can sustain 144FPS in 2026's AAA titles.";
                googleQuery = "ASUS ROG Phone 10 gaming benchmarks 2026";
            } else if (isCreative && needsVideo) {
                result = "For the serious cinematographer, the <b>Sony Xperia 1 VII</b> offers a true variable telephoto lens and professional-grade monitor capabilities that no other phone can match.";
                googleQuery = "Sony Xperia 1 VII professional video mode price AU";
            } else if ((isWorker || isDev) && aesthetics === 'desktop') {
                result = "If you demand extreme multi-tasking and DeX support, the <b>Samsung Galaxy Z Fold 7</b> fundamentally transforms from phone to workstation.";
                googleQuery = "Galaxy Z Fold 7 2026 AU retail";
            } else if (needsZoom || (isWorker && isDev)) {
                result = "A perfect power match: The <b>Galaxy S25 Ultra</b>. The massive 200MP sensor and 100x zoom allow you to work exactly the way you demand.";
                googleQuery = "Galaxy S25 Ultra 2026 unlocked JB HiFi pricing";
            } else if (needsValue && isPro) {
                result = "The <b>Xiaomi 16 Ultra</b> delivers hardware that rivals the big brands for $500 less. Its 1-inch sensor is a masterclass in mobile photography.";
                googleQuery = "Xiaomi 16 Ultra Australia import price";
            } else if (aesthetics === 'compact') {
                result = "The <b>Galaxy Z Flip 7</b> is the ultimate pocketable flagship, blending fashion with the full power of Galaxy AI.";
                googleQuery = "Samsung Galaxy Z Flip 7 price Australia";
            } else {
                result = "The <b>OnePlus 14 Pro</b> emerges as the most utilitarian choice to maximize your multi-faceted needs with the world's fastest charging.";
                googleQuery = "OnePlus 14 Pro price Australia 2026";
            }
        }

        resultText.innerHTML = result;
        const verifyUrl = `https://www.google.com/search?q=${encodeURIComponent(googleQuery)}`;
        verifyContainer.innerHTML = `<a href="${verifyUrl}" target="_blank" rel="noopener noreferrer" class="ext-style-190">Verify Live Availability & Specials</a>`;
        document.getElementById('final-cta').style.display = 'block';
        setTimeout(() => { window.open(verifyUrl, '_blank'); }, 3000);
    }

    window.resetWizard = function() {
        selections = { profile: [], priority: [], os: '', portability: '' };
        document.querySelectorAll('.step-content').forEach(s => s.classList.remove('active'));
        document.getElementById('step-1').classList.add('active');
        document.getElementById('recommender-status').innerText = "SYNTHESIZING PROFILE...";
        document.getElementById('final-cta').style.display = 'none';
        document.getElementById('verify-link-container').innerHTML = '';
        document.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
    };

    // --- Global Price Sentinel ---
    window.registerAlert = async function() {
        const email = document.getElementById('alert-email').value;
        const laptop = document.getElementById('alert-laptop').value;
        const ui = document.getElementById('alerter-ui');

        if (!email || !email.includes('@')) {
            alert("Please enter a valid vault email address.");
            return;
        }

        ui.innerHTML = `
            <div class="ext-style-191">
                <div class="spinner ext-style-192"></div>
                <div class="ext-style-193">ESTABLISHING NEURAL HANDSHAKE...</div>
                <div class="ext-style-194">Synchronizing with Resend API Relay...</div>
            </div>
        `;

        const API_BASE = `${window.location.protocol}//${window.location.hostname}:3000`;
        try {
            const response = await fetch(`${API_BASE}/api/send-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, laptop, bothKeys: ['iphone', 'samsung'] })
            });
            const data = await response.json();
            if (data.error) throw new Error("Service Error");

            const selectionName = laptop === 'both' ? 'iPhone 17 Pro Max & Galaxy S25 Ultra' : (laptop === 'iphone' ? 'iPhone 17 Pro Max' : 'Galaxy S25 Ultra');
            ui.innerHTML = `
                <div class="ext-style-195">
                    <div class="ext-style-196">&check;</div>
                    <div class="ext-style-193">SENTINEL ACTIVATED</div>
                    <div class="ext-style-197">Confirmation transmitted to <b>${email}</b>. Global monitoring is <b>LIVE</b>.</div>
                    <button onclick="window.location.reload()" class="ext-style-198">Setup Another Alert</button>
                </div>
            `;
        } catch (err) {
            ui.innerHTML = `<div class="ext-style-191"><div class="ext-style-199">TRANSMISSION FAILED</div><button onclick="window.location.reload()" class="ext-style-198">Try Again</button></div>`;
        }
    };

    async function initHealthCheck() {
        const dot = document.getElementById('health-dot');
        const text = document.getElementById('health-text');
        const btn = document.getElementById('btn-activate');
        const API_BASE = `${window.location.protocol}//${window.location.hostname}:3000`;
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000));

        try {
            const res = await Promise.race([fetch(`${API_BASE}/api/health`), timeout]);
            if (res.ok) {
                dot.style.background = '#00ff66';
                dot.style.boxShadow = '0 0 10px #00ff66';
                text.innerText = 'Neural Handshake: Online';
            } else throw new Error();
        } catch (e) {
            dot.style.background = '#ff4444';
            dot.style.boxShadow = '0 0 10px #ff4444';
            text.innerText = 'Neural Handshake: Offline';
            if (btn) { btn.style.opacity = '0.5'; btn.style.pointerEvents = 'none'; }
        }
    }

    // --- Local Suburb Stock Audit ---
    const RETAILER_HUB_MATRIX = {
        SYDNEY: { label: "Sydney Alpha Hub", stores: ["Apple George St", "Telstra Discovery CBD", "Optus Parramatta", "Samsung Experience Sydney", "JB Hi-Fi CBD", "The Good Guys Alexandria"] },
        MELBOURNE: { label: "Melbourne Alpha Hub", stores: ["Apple Chadstone", "Telstra CBD Plaza", "Optus Bourke St", "Samsung Highpoint", "JB Hi-Fi Elizabeth St", "Harvey Norman QV"] },
        BRISBANE: { label: "Brisbane Mobile Hub", stores: ["Telstra Queen St", "Optus CBD Centre", "Samsung Brisbane", "JB Hi-Fi Mall", "Vodafone Central", "Officeworks North Quay"] },
        PERTH: { label: "Perth West Coast Hub", stores: ["Apple Perth", "Telstra Murray St", "Optus Perth CBD", "Samsung Experience Perth", "JB Hi-Fi CBD", "Dick Smith Virtual Kiosk"] },
        ADELAIDE: { label: "Adelaide South Hub", stores: ["Telstra Rundle Mall", "Optus Marion", "Samsung Adelaide", "JB Hi-Fi Rundle", "Amaysim Retail Hub"] },
        CANBERRA: { label: "ACT Federal Hub", stores: ["Apple Canberra Centre", "Telstra Civic", "Optus Civic", "JB Hi-Fi Civic", "Vodafone Canberra"] },
        GOLD_COAST: { label: "Gold Coast Alpha Hub", stores: ["Samsung Robina", "Telstra Pacific Fair", "Optus Southport", "JB Hi-Fi Pacific Fair", "Harvey Norman Bundall"] },
        DARWIN: { label: "Darwin Northern Hub", stores: ["Telstra Casuarina", "Optus Darwin", "JB Hi-Fi Darwin City", "Boost Mobile Hub"] },
        HOBART: { label: "Hobart Island Center", stores: ["Telstra Hobart CBD", "Optus Hobart", "JB Hi-Fi Hobart CBD", "Vodafone Hub"] }
    };

    window.initiateSentinelPulse = async function() {
        const initialBox = document.getElementById('sentinel-initial-trigger');
        const radarDisplay = document.getElementById('geo-radar-display');
        const statusText = document.getElementById('geo-status-text');
        const territoryGrid = document.getElementById('sentinel-territory-grid');

        initialBox.style.display = 'none';
        radarDisplay.style.display = 'block';
        statusText.innerText = "INITIALIZING SATELLITE UPLINK...";
        await new Promise(r => setTimeout(r, 1200));
        statusText.innerText = "LINK ESTABLISHED - SELECT TERRITORY";
        radarDisplay.style.display = 'none';
        territoryGrid.style.display = 'block';
    };

    window.selectTerritory = function(hubKey) {
        document.getElementById('sentinel-territory-grid').style.display = 'none';
        document.getElementById('geo-radar-display').style.display = 'block';
        executeSentinelScan(hubKey);
    };

    async function executeSentinelScan(hubKey) {
        const statusText = document.getElementById('geo-status-text');
        const radarDisplay = document.getElementById('geo-radar-display');
        const resultsMatrix = document.getElementById('geo-results-matrix');
        const dealGrid = document.getElementById('geo-deal-grid');
        const pinText = document.getElementById('geo-location-pin');
        const hub = RETAILER_HUB_MATRIX[hubKey] || { label: hubKey, stores: ["Telstra", "Optus", "JB Hi-Fi"] };

        statusText.innerText = `SCRAPING VERIFIED HUB: ${hubKey}...`;
        await new Promise(r => setTimeout(r, 1200));
        
        const handshake = document.getElementById('handshake-overlay');
        if (handshake) { handshake.classList.add('active'); setTimeout(() => handshake.classList.remove('active'), 2500); }
        await new Promise(r => setTimeout(r, 800));

        radarDisplay.style.display = 'none';
        resultsMatrix.style.display = 'block';
        pinText.innerHTML = `Sentinel Lock: <b style="color: #00d2ff;">${hub.label}</b> | 100% Signal Integrity`;

        function calculateRealisticPrice(base, hub, store) {
            let hash = 0;
            const str = hub + store;
            for (let i = 0; i < str.length; i++) {
                hash = ((hash << 5) - hash) + str.charCodeAt(i);
                hash |= 0;
            }
            // City-based multipliers for realism
            const hubPremiums = { SYDNEY: 1.12, MELBOURNE: 1.08, PERTH: 1.15, DARWIN: 1.25, CANBERRA: 1.05, ADELAIDE: 1.02, BRISBANE: 1.07 };
            const premium = hubPremiums[hub] || 1.0;
            
            // Random-ish variance based on store name
            let variance = (Math.abs(hash) % 150) - 75; // -$75 to +$75
            if (store.toLowerCase().includes('jb hi-fi')) variance -= 50; // Discount king
            if (store.toLowerCase().includes('apple')) variance += 100; // Premium tax
            
            return Math.floor((base * premium) + variance);
        }

        let html = '';
        const storeData = hub.stores.map(name => {
            const iphone = calculateRealisticPrice(2199, hubKey, name);
            const galaxy = calculateRealisticPrice(2049, hubKey, name);
            return { name, iphone, galaxy, total: iphone + galaxy };
        });

        // CRITICAL FIX: Sort by total price ASCENDING (Lowest price is Best Value)
        storeData.sort((a, b) => a.total - b.total);

        const storesToRender = storeData.slice(0, 3);
        storesToRender.forEach((store, index) => {
            const isTop = index === 0;
            html += `
                <div class="retailer-deal-card scroll-reveal ${isTop ? 'winner-highlight' : ''}">
                    ${isTop ? '<div class="best-value-badge">BEST VALUE HUB</div>' : ''}
                    <div class="deal-card-header"><h4 class="deal-card-title">${store.name}</h4></div>
                    <div class="deal-prices">
                        <div class="price-row"><span class="price-label">iPhone 17 Pro Max:</span><span class="price-badge">$${store.iphone.toLocaleString()}</span></div>
                        <div class="price-row"><span class="price-label">Galaxy S25 Ultra:</span><span class="price-badge">$${store.galaxy.toLocaleString()}</span></div>
                        <div class="price-row" style="margin-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px;">
                            <span class="price-label" style="font-weight: 800;">Bundle Total:</span>
                            <span class="price-badge" style="background: var(--accent-purple);">$${store.total.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        dealGrid.innerHTML = html;
        setTimeout(() => { document.querySelectorAll('#geo-deal-grid .scroll-reveal').forEach(el => el.classList.add('visible')); }, 50);
    }

    // --- Image Contrast Analyzer ---
    function analyzeImageContrast(img) {
        return new Promise(res => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const proc = () => {
                canvas.width = img.width || 100; canvas.height = img.height || 100;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                let bright = 0;
                for (let i = 0; i < data.length; i += 4) bright += (data[i] + data[i+1] + data[i+2]) / 3;
                res((bright / (data.length / 4)) > 127.5);
            };
            if (img.complete) proc(); else img.onload = proc;
        });
    }

    // --- Carousel Controller ---
    class CarouselController {
        constructor(trackId, progressId, playBtnId) {
            this.track = document.getElementById(trackId);
            this.progressFill = document.getElementById(progressId);
            this.playBtn = document.getElementById(playBtnId);
            this.slides = this.track ? this.track.querySelectorAll('.carousel-slide') : [];
            this.current = 0; this.playing = true; this.progress = 0;
            if (this.track) this.init();
        }
        init() {
            this.slides.forEach(slide => {
                const img = slide.querySelector('img');
                const content = slide.querySelector('.slide-content');
                if (img && content) analyzeImageContrast(img).then(isLight => { if (isLight) content.style.color = '#000'; });
            });
            setInterval(() => {
                if (this.playing) {
                    this.progress += 2;
                    if (this.progressFill) this.progressFill.style.width = `${this.progress}%`;
                    if (this.progress >= 100) this.next();
                }
            }, 100);
        }
        next() { this.current = (this.current + 1) % this.slides.length; this.update(); }
        prev() { this.current = (this.current - 1 + this.slides.length) % this.slides.length; this.update(); }
        update() { this.track.style.transform = `translateX(-${this.current * 100}%)`; this.progress = 0; }
        togglePlay() { this.playing = !this.playing; if (this.playBtn) this.playBtn.innerText = this.playing ? "❚❚" : "▶"; }
    }

    // --- Rating System ---
    let rating = 0;
    window.setRating = (val) => {
        rating = val;
        document.querySelectorAll('.star').forEach((s, i) => s.classList.toggle('active', i < val));
    };
    window.hoverRating = (val) => document.querySelectorAll('.star').forEach((s, i) => s.style.color = i < val ? '#FFD700' : '');
    window.resetHover = () => document.querySelectorAll('.star').forEach((s, i) => s.style.color = i < rating ? '#FFD700' : '');
    window.submitRating = () => {
        const modal = document.querySelector('.rating-modal');
        modal.innerHTML = `<h3>FEEDBACK RECEIVED</h3><p>Thank you for your insight.</p><button onclick="document.getElementById('rating-modal-overlay').style.display='none'">Close</button>`;
    };

    // --- Performance Bar Animator ---
    function animatePerformanceBars() {
        const section = document.getElementById('benchmark-lab') || document.querySelector('.benchmarks');
        if (!section) return;
        const animate = () => section.querySelectorAll('.bar-inner').forEach(bar => { if (bar.dataset.width) bar.style.width = bar.dataset.width; });
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(entries => { if (entries[0].isIntersecting) animate(); }, { threshold: 0.1 }).observe(section);
        } else animate();
    }

    // --- Initialization ---
    document.addEventListener('DOMContentLoaded', () => {
        initHealthCheck();
        animatePerformanceBars();
        
        window.carousel1 = new CarouselController('carousel-track', 'progress-1', 'play-pause-1');
        window.carousel2 = new CarouselController('carousel-track-2', 'progress-2', 'play-pause-2');

        const searchForm = document.getElementById('search-form');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const query = document.getElementById('site-search').value.trim();
                if (query) window.executeNeuralSearch(query);
            });
        }

        // Voice Search
        const voiceBtn = document.getElementById('voice-trigger');
        if (voiceBtn && ('webkitSpeechRecognition' in window)) {
            const recognition = new webkitSpeechRecognition();
            voiceBtn.addEventListener('click', () => recognition.start());
            recognition.onresult = (e) => {
                const transcript = e.results[0][0].transcript;
                document.getElementById('site-search').value = transcript;
                searchForm.dispatchEvent(new Event('submit'));
            };
        }

        // Scroll Reveal
        const revealObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); } });
        }, { threshold: 0.1 });
        document.querySelectorAll('.scroll-reveal, .product-column, .hub-section').forEach(el => revealObserver.observe(el));

        // --- Cinematic Prompt Generator ---
        const generateBtn = document.getElementById('generate-prompt-btn');
        const copyBtn = document.getElementById('copy-prompt-btn');
        const promptOutput = document.getElementById('prompt-output');
        const deviceSelect = document.getElementById('prompt-device-select');

        if (generateBtn && promptOutput && deviceSelect) {
            const shotTypes = ["Macro sweep across the chassis", "Slow dolly tracking shot", "Extreme close-up showcasing micro-textures", "Dynamic orbit shot at 120fps", "Hero establishing shot from a low angle"];
            const lightingStyles = ["volumetric cyberpunk neon lighting", "cinematic chiaroscuro with deep shadows", "soft studio rim lighting", "dramatic moody silhouette lighting", "golden hour atmospheric light leaks"];
            const renderEngines = ["Unreal Engine 5 render, Path Traced", "Octane Render, photorealistic", "Redshift cinematic render, 8k resolution", "shot on ARRI Alexa 65, 85mm f/1.2", "anamorphic lens flare, incredibly detailed"];
            const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
            let typeWriterInterval = null;

            generateBtn.addEventListener('click', () => {
                const device = deviceSelect.value;
                const deviceName = device === 'iphone' ? "Apple iPhone 17 Pro Max" : "Samsung Galaxy S25 Ultra";
                const hardwareSpecs = device === 'iphone' ? "Grade 5 Titanium architectural contour, Ceramic Shield Ultra, and the 48MP Sensor-Shift LOG camera module" : "monolithic Gorilla Armor glass, Titanium frame, and the massive 200MP ISOCELL HP4 camera array with periscope lens";
                const prompt = `Highly detailed commercial product video of the ${deviceName}. ${getRandom(shotTypes)} highlighting the ${hardwareSpecs}. ${getRandom(lightingStyles)}, highly reflective premium materials, ${getRandom(renderEngines)}, shallow depth of field, award-winning cinematography, ultra-realistic 8k.`;
                
                if (typeWriterInterval) clearInterval(typeWriterInterval);
                promptOutput.value = "";
                let i = 0;
                typeWriterInterval = setInterval(() => {
                    promptOutput.value += prompt.charAt(i);
                    i++;
                    if (i >= prompt.length) clearInterval(typeWriterInterval);
                }, 10);
            });

            if (copyBtn) {
                copyBtn.addEventListener('click', () => {
                    if (!promptOutput.value) return;
                    navigator.clipboard.writeText(promptOutput.value).then(() => {
                        const originalHTML = copyBtn.innerHTML;
                        copyBtn.innerHTML = `COPIED!`;
                        setTimeout(() => { copyBtn.innerHTML = originalHTML; }, 2000);
                    });
                });
            }
        }

        // --- Video Controls ---
        const video = document.getElementById('sentient-gateway-video');
        const videoBtn = document.getElementById('video-control-pivot-ios');
        const videoIcon = document.getElementById('pivot-icon-ios');

        if (video && videoBtn) {
            videoBtn.addEventListener('click', () => {
                if (video.paused) {
                    video.play();
                    if (videoIcon) videoIcon.innerHTML = '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>';
                } else {
                    video.pause();
                    if (videoIcon) videoIcon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
                }
            });
        }

    // --- Sentinel Technical Export Engine v5.2 [STATIC DOWNLOAD PROTOCOL] ---
    window.runSentinelExportV5 = async function() {
        const modal = document.getElementById('export-console-v5');
        const log = document.getElementById('v5-log');
        const progress = document.getElementById('v5-progress-fill');

        if (!modal) {
            console.error("Sentinel Error: Missing export console.");
            return;
        }

        modal.classList.add('active');
        
        const steps = [
            { text: "ESTABLISHING QUANTUM LINK...", p: 20 },
            { text: "AUTHENTICATING BIOMETRICS...", p: 40 },
            { text: "RETRIEVING ENCRYPTED DOSSIER...", p: 70 },
            { text: "BYPASSING NEURAL FIREWALL...", p: 90 }
        ];

        for (const step of steps) {
            log.innerText = step.text;
            progress.style.width = `${step.p}%`;
            await new Promise(r => setTimeout(r, 800));
        }

        try {
            // Trigger direct download of the provided document
            const downloadUrl = 'assets/Sentinel_Technical_Whitepaper_2026.pdf';
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = 'TechShowdown_2026_Sentinel_Report.pdf';
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
            console.error("Sentinel Download Failure:", err);
            log.innerText = "ERROR: UPLINK SEVERED";
            log.style.color = "#ff4444";
            setTimeout(() => {
                modal.classList.remove('active');
            }, 3000);
        }
    };
});

})();
