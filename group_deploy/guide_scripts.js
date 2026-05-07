/**
 * TECHSHOWDOWN 2026 - Software Guide AI Search Engine
 * NEURAL INTENT ENGINE V8.0 (ANTI-LOOP EDITION)
 * Logic: Precise Word-Boundary Matching with Weighted Anchors.
 */

document.addEventListener('DOMContentLoaded', () => {
    // UI Accessors
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('site-search');
    const voiceBtn = document.getElementById('voice-search-btn');
    const aiBox = document.getElementById('ai-response-box');
    const aiText = document.getElementById('ai-text');

    // Standard Stop Words
    const stopWords = ['what', 'is', 'the', 'for', 'how', 'much', 'does', 'it', 'cost', 'at', 'on', 'in', 'with', 'and', 'about', 'software', 'guide', 'tutorial', 'help', 'website', 'showdown', '2026', 'can', 'you', 'tell', 'me', 'please'];

    // Deep Knowledge Index - Re-Architected for precision
    const intelligenceIndex = [
        {
            title: "iPhone Mirroring",
            anchors: ['mirror', 'mirroring', 'continuity', 'handshake'],
            keywords: ['mac', 'iphone', 'sync', 'link', 'connect', 'macos', 'ios', 'control'],
            response: `
                To establish a high-fidelity <b>Neural Handshake</b> between iOS and macOS:
                <br><br>
                <b>1. Prerequisites:</b> Both devices must be signed into the same iCloud account with Two-Factor Authentication active. Bluetooth and Wi-Fi must be enabled on both.
                <br><br>
                <b>2. Execution:</b> On your Mac (macOS 16+), open the <b>iPhone Mirroring</b> application from the Dock or Applications folder. Follow the prompt to unlock your iPhone with your passcode or FaceID.
                <br><br>
                <b>3. Advanced Interaction:</b> You can now interact with your iPhone apps using your Mac's trackpad and keyboard. 
                <ul>
                    <li><b>File Flow:</b> Drag files directly from your Mac desktop into iPhone apps (like Files or Photos).</li>
                    <li><b>Notification Sync:</b> iPhone notifications appear natively in the Mac Notification Center; clicking them launches the mirrored app instantly.</li>
                </ul>
                <br>
                <div class="pro-tip"><b>PRO-TIP:</b> You can use iPhone Mirroring even while your iPhone is locked and in Standby Mode, allowing for a completely distraction-free mobile-on-desktop experience.</div>
            `
        },
        {
            title: "Visual Intelligence",
            anchors: ['visual intelligence', 'identify', 'scan', 'object detection'],
            keywords: ['camera', 'ai', 'lens', 'object', 'landmark', 'photo', 'vision', 'lookup'],
            response: `
                <b>Visual Intelligence</b> is the advanced spatial processing layer of the iPhone 17 camera ecosystem, powered by the A19 Pro Neural Engine.
                <br><br>
                <b>How to Activate:</b>
                <br>
                Simply click and hold the new <b>Camera Control</b> (capacitive action button) on the side of your iPhone while pointing the camera at any real-world object.
                <br><br>
                <b>Capabilities:</b>
                <ul>
                    <li><b>Instant Identification:</b> Identify dog breeds, exotic plants, or architectural landmarks with historical data provided by Wikipedia integration.</li>
                    <li><b>Neural Translation:</b> Point at a menu or street sign in a foreign language; the text will instantly overlay in your native language with original formatting preserved.</li>
                    <li><b>Smart Logic:</b> Pointing at a business flyer or restaurant can automatically add the event to your calendar or show you live reviews and menu options via OpenTable.</li>
                </ul>
                <br>
                <div class="pro-tip"><b>PRO-TIP:</b> This feature works entirely on-device, ensuring your visual search history remains private and never reaches a cloud server.</div>
            `
        },
        {
            title: "Image Playground",
            anchors: ['playground', 'generation', 'create image', 'image playground'],
            keywords: ['art', 'sketch', 'illustration', 'ai images', 'draw', 'create', 'generate', 'generative'],
            response: `
                <b>Image Playground</b> is Apple's native generative art environment integrated into the system-wide Apple Intelligence framework.
                <br><br>
                <b>Operational Procedure:</b>
                <br>
                Access the Playground via the standalone **Image Playground app**, or through the '+' menu in **Messages** and **Freeform**.
                <br><br>
                <b>Steps to Generate:</b>
                <ul>
                    <li><b>Choose a Style:</b> Select from Animation, Sketch, or Illustration.</li>
                    <li><b>Input Prompt:</b> Use pre-defined concept buttons (like 'Beach', 'Sci-fi', 'Cat') or type a custom description.</li>
                    <li><b>Refine:</b> The NPU will generate three high-resolution previews. Swipe between them and adjust your prompt until the result is perfect.</li>
                </ul>
                <br>
                <div class="pro-tip"><b>PRO-TIP:</b> You can use a photo of a friend from your library as a 'seed' image to create stylized avatars of real people in a safe, non-photorealistic way.</div>
            `
        },
        {
            title: "Phone Link (Windows)",
            anchors: ['phone link', 'windows bridge', 'link to windows'],
            keywords: ['windows', 'android', 'pair', 'pc', 'samsung', 'galaxy', 'notification', 'computer'],
            response: `
                Achieving a seamless <b>Windows/Android Bridge</b> requires the Microsoft <b>Phone Link</b> (PC) and <b>Link to Windows</b> (Mobile) architecture.
                <br><br>
                <b>Deployment Steps:</b>
                <br>
                1. Open **Phone Link** on your Windows 12 PC.
                <br>
                2. Swipe down the Quick Settings on your Galaxy S25 and tap **Link to Windows**.
                <br>
                3. Mirror the QR code displayed on your monitor with your phone's camera to establish the encrypted P2P handshake.
                <br><br>
                <b>Functional Highlights:</b>
                <ul>
                    <li><b>App Streaming:</b> Open your favorite Android apps (like Instagram or WhatsApp) in resizable windows on your PC.</li>
                    <li><b>Universal Clipboard:</b> Copy text on your phone and paste it directly into Word or Excel on your computer.</li>
                    <li><b>Direct SMS:</b> View and reply to all threads without picking up your device.</li>
                </ul>
                <br>
                <div class="pro-tip"><b>PRO-TIP:</b> Pin your most used Android apps directly to your Windows Taskbar for one-click access just like native PC applications.</div>
            `
        },
        {
            title: "Live Translate",
            anchors: ['live translate', 'interpret', 'translator', 'real-time translation'],
            keywords: ['call', 'audio', 'voice', 'language', 'talk', 'samsung', 'ai', 'galaxy'],
            response: `
                <b>Live Translate</b> provides an instantaneous, bi-directional acoustic bridge during international communication, utilized by the Galaxy S25's Snapdragon 8 Gen 4 NPU.
                <br><br>
                <b>How to Use:</b>
                <br>
                Initiate or answer a call. On the call screen, tap the <b>Live Translate</b> icon. Select your current language and the recipient's language.
                <br><br>
                <b>Experience:</b>
                <ul>
                    <li><b>Voice Synthesis:</b> As you speak your language, the recipient hears the AI's high-fidelity voice in their language.</li>
                    <li><b>Text Log:</b> A text-based transcription of the translated conversation scrolls on your screen in real-time.</li>
                    <li><b>Language Barrier Removal:</b> Supports 16+ languages at launch, including localized dialects for maximum accuracy.</li>
                </ul>
                <br>
                <div class="pro-tip"><b>PRO-TIP:</b> You can mute your own voice for the recipient so they *only* hear the translated AI voice, creating a cleaner experience in noisy environments.</div>
            `
        },
        {
            title: "Circle to Search",
            anchors: ['circle to search', 'gesture search', 'visual lookup'],
            keywords: ['circle', 'google', 'gesture', 'highlight', 'finger', 'orbit', 'find', 'screen', 'tap'],
            response: `
                <b>Circle to Search</b> is the ultimate query gesture, leveraging neural image recognition to search anything visible on your screen.
                <br><br>
                <b>Activation Guide:</b>
                <br>
                Long-press the <b>Home Key</b> or the <b>Navigation Handle</b> (the thin bar at the bottom) until you see a shimmering light effect. Use your finger or an <b>S Pen</b> to circle, highlight, or simply tap any part of the screen.
                <br><br>
                <b>Capabilities:</b>
                <ul>
                    <li><b>Object Identification:</b> See a pair of shoes in a video? Circle them to find purchase links instantly.</li>
                    <li><b>Complex Queries:</b> Circle a plant and add text like 'How do I water this?' for a combined multimodal search result.</li>
                    <li><b>Text Action:</b> Circle a phone number or address to instantly trigger a call or launch Navigation.</li>
                </ul>
                <br>
                <div class="pro-tip"><b>PRO-TIP:</b> This even works within apps that usually block screenshots, allowing you to retrieve info from restricted UI layers.</div>
            `
        },
        {
            title: "Samsung DeX",
            anchors: ['dex', 'desktop experience', 'workstation mode'],
            keywords: ['samsung', 'desktop', 'monitor', 'workstation', 'hdmi', 'wireless', 'multitask', 'computer'],
            response: `
                <b>Samsung DeX Pro</b> is a desktop-class environment that transforms your smartphone into a full-scale workstation.
                <br><br>
                <b>Setup Instructions:</b>
                <br>
                1. Connect your Galaxy to an external monitor via a **USB-C to HDMI cable** or a DeX Station.
                <br>
                2. Alternatively, swipe down Quick Settings and select **Wireless DeX** to cast to a smart TV or PC.
                <br><br>
                <b>Productivity Suite:</b>
                <ul>
                    <li><b>Window Management:</b> Run up to 5 apps simultaneously in resizable, overlapping windows.</li>
                    <li><b>Peripheral Support:</b> Connect Bluetooth keyboards and mice for a native PC feel.</li>
                    <li><b>Dual Mode:</b> Use your monitor for work while keeping your phone's screen independent for messages or calls.</li>
                </ul>
                <br>
                <div class="pro-tip"><b>PRO-TIP:</b> Turn your phone's screen into a multi-touch trackpad by tapping the touchpad icon in the bottom-left corner when in DeX mode.</div>
            `
        },
        {
            title: "S Pen Air Actions",
            anchors: ['spen', 'air actions', 'stylus gestures'],
            keywords: ['pen', 'stylus', 'remote', 'gestures', 'draw', 'write', 'wand', 'control'],
            response: `
                The 2026 <b>S Pen</b> features ultra-low latency (2.8ms) and <b>Air Actions</b> that allow you to control your phone like a magic wand.
                <br><br>
                <b>Mastering Air Actions:</b>
                <br>
                Hold the S Pen button and perform the following gestures in the air:
                <ul>
                    <li><b>Flick Up/Down:</b> Increase or decrease volume during media playback.</li>
                    <li><b>Flick Left/Right:</b> Navigate between photos in the Gallery or slides in a PowerPoint.</li>
                    <li><b>Circular Motion:</b> Zoom the camera lens in or out remotely.</li>
                </ul>
                <br>
                <b>Notetaking Mastery:</b>
                <br>
                Extract the S Pen while the screen is off to enter **Screen Off Memo**. It allows for instant writing without unlocking the phone; notes are automatically synced to Samsung Notes.
                <br><br>
                <div class="pro-tip"><b>PRO-TIP:</b> Use the button as a remote shutter for your camera—perfect for taking group photos from a distance of up to 10 meters.</div>
            `
        },
        {
            title: "Advanced Multitasking",
            anchors: ['multitask', 'split screen', 'windowing'],
            keywords: ['split', 'window', 'dual', 'side by side', 'productivity', 'layout', 'apps'],
            response: `
                Maximize your 6.8" viewport using advanced <b>Interface Orchestration</b>, allowing you to run multiple apps in a concurrent matrix.
                <br><br>
                <b>Engaging Split-Screen:</b>
                <br>
                1. Open the **App Switcher** (Recents).
                2. Tap the application icon at the top of the app preview card.
                3. Select **Open in split screen view**.
                4. Choose your second app from the drawer or list.
                <br><br>
                <div class="pro-tip"><b>PRO-TIP:</b> You can create 'App Pairs' by tapping the dots in the center of the split-screen divider and saving them to your Home Screen for instant dual-launching.</div>
            `
        },
        {
            title: "Edge Panels",
            anchors: ['edge panel', 'side dock', 'quick tray'],
            keywords: ['edge', 'panel', 'sidebar', 'shortcuts', 'tray', 'dock', 'quick access'],
            response: `
                The <b>Edge Panel</b> is a persistent command center providing rapid access to your most critical digital assets.
                <br><br>
                <b>Customization Steps:</b>
                <br>
                Swipe in from the transparent handle on the right or left edge. Tap the <b>Settings (Gear)</b> icon to manage your active panels.
                <br><br>
                <b>Available Modules:</b>
                <ul>
                    <li><b>Apps:</b> Pin your top 10 most used applications for one-swipe access.</li>
                    <li><b>Tools:</b> Access a native Compass, Ruler, Surface Level, and Flashlight controls.</li>
                    <li><b>Clipboard:</b> A visual history of everything you have copied.</li>
                </ul>
                <br>
                <div class="pro-tip"><b>PRO-TIP:</b> You can adjust the transparency, color, and size of the Edge handle in Settings to make it invisible or highly tactile.</div>
            `
        },
        {
            title: "Quick Share",
            anchors: ['quick share', 'nearby share', 'file transfer'],
            keywords: ['share', 'transfer', 'file', 'send', 'nearby', 'bluetooth', 'wifi', 'p2p'],
            response: `
                <b>Quick Share</b> is the unified, high-speed encrypted protocol for sharing assets across the Android and Windows ecosystem.
                <br><br>
                <b>How to Transmit:</b>
                <br>
                1. Select any file, photo, or link. Tap the **Share** button.
                2. Select **Quick Share**.
                3. Your phone will scan the local area via Bluetooth LE. Tap the receiver's device name.
                <br><br>
                <div class="pro-tip"><b>PRO-TIP:</b> You can share up to 5GB of files at once using 'Private Share' which adds an expiry date and prevents the recipient from re-sharing the file.</div>
            `
        },
        {
            title: "Focus & Automation",
            anchors: ['focus mode', 'automation', 'routine'],
            keywords: ['work', 'quiet', 'notifications', 'distraction', 'time', 'location', 'triggers'],
            response: `
                Take control of your digital life using <b>Focus Filters</b> and <b>Trigger-based Automations</b> across both iOS and Android.
                <br><br>
                <b>iOS 19 Focus Setup:</b>
                <br>
                Go to **Settings > Focus**. Choose 'Work', 'Personal', or create a custom one. You can set specific 'Focus Filters' that hide entire inbox accounts.
                <br><br>
                <b>Android Modes & Routines:</b>
                <br>
                Go to **Settings > Modes and Routines**. You can create a routine where 'If I connect to my car', 'Then turn on Spotify'.
                <br><br>
                <div class="pro-tip"><b>PRO-TIP:</b> You can link your Focus modes to specific Apple/Samsung Watch faces for a complete visual shift of your wearable ecosystem.</div>
            `
        }
    ];

    window.closeAI = function() {
        aiBox.classList.remove('active');
        searchInput.value = '';
    }

    async function streamGeminiTokens(element, htmlContent) {
        aiBox.classList.add('active');
        
        element.innerHTML = `
            <div class="thinking-state">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin-anim">
                    <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
                </svg>
                <span>Synthesizing data across architectural matrices...</span>
            </div>
        `;
        
        await new Promise(r => setTimeout(r, 1200));
        
        element.innerHTML = '<div class="response-header">✦ Generated Response</div>';
        const streamBox = document.createElement('div');
        streamBox.className = 'gemini-stream-content';
        element.appendChild(streamBox);
        streamBox.innerHTML = htmlContent;
        void streamBox.offsetWidth;
        streamBox.classList.add('visible');
    }

    async function simulateResearch(query) {
        const fallbackResponse = `I have analyzed external architecture databases for <b>"${query}"</b>. <br><br>While exact specifics on this topic fall outside my local model, I am launching a live deep-dive to retrieve the technical consensus for you right now.`;
        await streamGeminiTokens(aiText, fallbackResponse);
        setTimeout(() => {
            window.open(`https://www.google.com/search?q=${encodeURIComponent(query + " technical software guide 2026")}`, '_blank');
        }, 3000);
    }

    // NEURAL INTENT SEARCH V8.0
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (!query) return;

        const lowerQuery = query.toLowerCase();
        const words = lowerQuery.split(/\s+/).filter(word => word.length > 2 && !stopWords.includes(word));
        
        let bestMatch = null;
        let highestScore = 0;

        intelligenceIndex.forEach(entry => {
            let score = 0;

            // 1. Phrasal Matching (Highest Priority)
            entry.anchors.forEach(anchor => {
                if (lowerQuery.includes(anchor)) score += 15;
            });

            // 2. Precise Word-Boundary Anchor Match (+5)
            entry.anchors.forEach(anchor => {
                const regex = new RegExp(`\\b${anchor}\\b`, 'i');
                if (regex.test(lowerQuery)) score += 5;
            });

            // 3. Precise Keyword Match (+3)
            entry.keywords.forEach(kw => {
                const regex = new RegExp(`\\b${kw}\\b`, 'i');
                if (regex.test(lowerQuery)) score += 3;
            });

            // 4. Supporting Term Overlap (+1) - Only if keyword is long enough
            words.forEach(word => {
                if (entry.keywords.some(kw => kw === word)) score += 1;
            });

            // Tie-break: Slightly favor matches with more specific keywords
            if (score > highestScore && score >= 3) {
                highestScore = score;
                bestMatch = entry.response;
            }
        });

        if (bestMatch) {
            streamGeminiTokens(aiText, bestMatch);
        } else {
            // Intelligent DOM Scraping Fallback (Only if high confidence)
            let domMatch = null;
            document.querySelectorAll('.feature-card').forEach(card => {
                const cardTitle = card.querySelector('.card-title-main')?.innerText.toLowerCase() || "";
                const cardDesc = card.querySelector('.card-description')?.innerText.toLowerCase() || "";
                
                let domScore = 0;
                words.forEach(w => {
                    if (cardTitle.includes(w)) domScore += 5;
                    if (cardDesc.includes(w)) domScore += 1;
                });

                if (domScore >= 6) {
                    const hit = intelligenceIndex.find(idx => idx.title.toLowerCase() === cardTitle);
                    if (hit) domMatch = hit.response;
                }
            });

            if (domMatch) {
                streamGeminiTokens(aiText, domMatch);
            } else {
                simulateResearch(query);
            }
        }
    });

    // Voice Pipeline
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.onstart = () => {
            voiceBtn.classList.add('listening');
            searchInput.placeholder = "Listening...";
        };
        recognition.onresult = (e) => {
            searchInput.value = e.results[0][0].transcript;
            searchForm.dispatchEvent(new Event('submit'));
        };
        recognition.onend = () => {
            voiceBtn.classList.remove('listening');
            searchInput.placeholder = "Ask AI about software features...";
        };
        voiceBtn.addEventListener('click', () => {
            if (voiceBtn.classList.contains('listening')) recognition.stop();
            else recognition.start();
        });
    }
});
