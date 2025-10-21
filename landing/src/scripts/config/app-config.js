/**
 * App Configuration
 * Configuración centralizada de la aplicación
 */

export const APP_CONFIG = {
    // URLs
    appUrl: 'https://zta.148.230.91.96.nip.io',
    adminUrl: 'https://admin-zta.148.230.91.96.nip.io',

    // QR Code
    qr: {
        elementId: 'qrcode',
        size: 180,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: 'H' // H = High error correction
    },

    // PWA Install
    install: {
        buttonIds: ['installBtn', 'installBtnLarge'],
        platformHintId: 'platform-hint'
    },

    // Platform Messages
    messages: {
        android: '🤖 Android detectado - ¡Puedes instalar con un clic!',
        ios: '🍎 iOS detectado - Usa el botón Compartir en Safari para instalar',
        desktop: '💻 ¡Disponible para Android, iOS y Desktop!',
        default: '💡 Tip: Agrega SUMAQ a tu pantalla de inicio para acceso rápido'
    },

    // Tab System
    tabs: {
        buttonSelector: '.tab-btn',
        contentSelector: '.tab-content',
        activeClass: 'active'
    }
};
