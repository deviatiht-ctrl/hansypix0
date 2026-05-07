let deferredPrompt;
let installButton;

function isHomePage() {
    const path = window.location.pathname.toLowerCase();
    return path === '/' || path.endsWith('/index.html') || path.endsWith('/index.html');
}

function detectDevice() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    if (/android/i.test(userAgent)) {
        return 'android';
    }
    
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return 'ios';
    }
    
    return 'other';
}

function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches || 
           window.navigator.standalone === true;
}

function createInstallPrompt() {
    const device = detectDevice();
    
    // Don't show if already installed as PWA
    if (isStandalone()) {
        console.log('App is already installed as PWA');
        return;
    }
    
    let instructionsHTML = '';
    
    if (device === 'ios') {
        instructionsHTML = `
            <div class="pwa-ios-instructions">
                <p class="pwa-step"><span class="step-num">1</span> Tap the <strong>Share</strong> button <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg> at the bottom of Safari</p>
                <p class="pwa-step"><span class="step-num">2</span> Scroll down and tap <strong>"Add to Home Screen"</strong></p>
                <p class="pwa-step"><span class="step-num">3</span> Tap <strong>"Add"</strong> in the top right corner</p>
            </div>
        `;
    }
    
    const promptHTML = `
        <div id="pwa-install-prompt" class="pwa-install-prompt ${device === 'ios' ? 'ios-prompt' : ''}">
            <div class="pwa-install-content">
                <button id="pwa-close-btn" class="pwa-close-btn" aria-label="Close">
                    <i data-lucide="x"></i>
                </button>
                <div class="pwa-header">
                    <img src="/src/logo.png" alt="HANSYPIX Logo" class="pwa-logo">
                    <div class="pwa-header-text">
                        <h3>HANSYPIX</h3>
                        <span class="pwa-tagline">Install our app</span>
                    </div>
                </div>
                <p class="pwa-description">${device === 'ios' ? 'Add HANSYPIX to your home screen for the best experience' : 'Install our app for a better experience'}</p>
                ${device !== 'ios' ? `
                <button id="pwa-install-btn" class="pwa-install-btn">
                    <i data-lucide="download"></i>
                    Install App
                </button>
                ` : instructionsHTML}
            </div>
        </div>
    `;
    
    const promptContainer = document.createElement('div');
    promptContainer.innerHTML = promptHTML;
    document.body.appendChild(promptContainer.firstElementChild);
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    installButton = document.getElementById('pwa-install-btn');
    const closeButton = document.getElementById('pwa-close-btn');
    const prompt = document.getElementById('pwa-install-prompt');
    
    if (installButton) {
        installButton.addEventListener('click', installApp);
    }
    
    closeButton.addEventListener('click', () => {
        prompt.classList.add('pwa-hide');
        setTimeout(() => prompt.remove(), 300);
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    });
}

async function installApp() {
    if (!deferredPrompt) {
        return;
    }
    
    deferredPrompt.prompt();
    
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
    } else {
        console.log('User dismissed the install prompt');
    }
    
    deferredPrompt = null;
    
    const prompt = document.getElementById('pwa-install-prompt');
    if (prompt) {
        prompt.classList.add('pwa-hide');
        setTimeout(() => prompt.remove(), 300);
    }
}

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    // Auto prompt only on homepage
    if (!isHomePage()) {
        return;
    }
    
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const dayInMs = 24 * 60 * 60 * 1000;
    
    // Show again after 1 day
    if (!dismissed || (Date.now() - dismissedTime > dayInMs)) {
        setTimeout(createInstallPrompt, 3000);
    }
});

window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    deferredPrompt = null;
    
    const prompt = document.getElementById('pwa-install-prompt');
    if (prompt) {
        prompt.remove();
    }
});

// iOS-specific: Show install prompt on page load since iOS doesn't support beforeinstallprompt
document.addEventListener('DOMContentLoaded', () => {
    if (!isHomePage()) {
        return;
    }

    const device = detectDevice();
    
    if (device === 'ios' && !isStandalone()) {
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        const dismissedTime = dismissed ? parseInt(dismissed) : 0;
        const dayInMs = 24 * 60 * 60 * 1000;
        
        // Show again after 1 day
        if (!dismissed || (Date.now() - dismissedTime > dayInMs)) {
            setTimeout(createInstallPrompt, 2000);
        }
    }
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        const swPath = '/sw.js?v=20260308-5';
        navigator.serviceWorker.getRegistrations()
            .then((registrations) => Promise.all(registrations.map((r) => r.unregister())))
            .then(() => navigator.serviceWorker.register(swPath, { updateViaCache: 'none' }))
            .then((registration) => registration.update())
            .then(() => console.log('ServiceWorker registration refreshed'))
            .catch((error) => console.log('ServiceWorker registration failed:', error));
    });
}

