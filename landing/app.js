// PWA Install
let deferredPrompt;
const installBtn = document.getElementById('installBtn');
const installBtnLarge = document.getElementById('installBtnLarge');

// Detect platform
function detectPlatform() {
    const userAgent = navigator.userAgent.toLowerCase();
    const isAndroid = /android/.test(userAgent);
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isChrome = /chrome/.test(userAgent) && !/edge/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);

    return { isAndroid, isIOS, isChrome, isSafari };
}

// Show install instructions based on platform
function showPlatformInstructions() {
    const platform = detectPlatform();

    if (platform.isAndroid && platform.isChrome) {
        // Android Chrome - show install button
        document.getElementById('platform-hint').textContent = '🤖 Android detectado - ¡Puedes instalar con un clic!';
    } else if (platform.isIOS) {
        // iOS - show Safari instructions
        document.getElementById('platform-hint').textContent = '🍎 iOS detectado - Usa el botón Compartir en Safari para instalar';
        // Auto-select iOS tab
        document.querySelector('[data-tab="ios"]').click();
    } else {
        document.getElementById('platform-hint').textContent = '💻 ¡Disponible para Android, iOS y Desktop!';
    }
}

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    // Show both install buttons
    if (installBtn) installBtn.style.display = 'inline-block';
    if (installBtnLarge) installBtnLarge.style.display = 'inline-block';

    console.log('Install prompt available');
});

// Handle install button clicks
function handleInstall() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
            deferredPrompt = null;
            if (installBtn) installBtn.style.display = 'none';
            if (installBtnLarge) installBtnLarge.style.display = 'none';
        });
    } else {
        // If prompt not available, redirect to app
        window.location.href = 'https://zta.148.230.91.96.nip.io';
    }
}

if (installBtn) {
    installBtn.addEventListener('click', handleInstall);
}
if (installBtnLarge) {
    installBtnLarge.addEventListener('click', handleInstall);
}

// Generate QR Code
document.addEventListener('DOMContentLoaded', () => {
    const qrcode = new QRCode(document.getElementById('qrcode'), {
        text: 'https://zta.148.230.91.96.nip.io',
        width: 180,
        height: 180,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    });

    // Show platform-specific instructions
    showPlatformInstructions();

    // Tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;

            // Remove active class from all
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked
            btn.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
});
