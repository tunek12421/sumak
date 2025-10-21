/**
 * PWA Installer Module
 * Maneja la instalación de PWA
 */

import { APP_CONFIG } from '../config/app-config.js';
import { detectPlatform, getPlatformType } from './platform-detector.js';

class PWAInstaller {
    constructor() {
        this.deferredPrompt = null;
        this.installButtons = [];
        this.init();
    }

    /**
     * Inicializa el instalador
     */
    init() {
        // Obtener botones de instalación
        APP_CONFIG.install.buttonIds.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                this.installButtons.push(btn);
                btn.addEventListener('click', () => this.handleInstall());
            }
        });

        // Escuchar el evento beforeinstallprompt
        window.addEventListener('beforeinstallprompt', (e) => this.onBeforeInstallPrompt(e));

        // Mostrar instrucciones según la plataforma
        this.showPlatformInstructions();
    }

    /**
     * Maneja el evento beforeinstallprompt
     */
    onBeforeInstallPrompt(e) {
        e.preventDefault();
        this.deferredPrompt = e;

        // Mostrar botones de instalación
        this.installButtons.forEach(btn => {
            btn.style.display = 'inline-block';
        });

        console.log('✅ Install prompt available');
    }

    /**
     * Maneja el clic en el botón de instalación
     */
    async handleInstall() {
        if (!this.deferredPrompt) {
            // Si no hay prompt disponible, redirigir a la app
            window.location.href = APP_CONFIG.appUrl;
            return;
        }

        // Mostrar el prompt de instalación
        this.deferredPrompt.prompt();

        // Esperar la respuesta del usuario
        const { outcome } = await this.deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('✅ User accepted the install prompt');
        } else {
            console.log('❌ User dismissed the install prompt');
        }

        // Limpiar el prompt
        this.deferredPrompt = null;

        // Ocultar botones
        this.installButtons.forEach(btn => {
            btn.style.display = 'none';
        });
    }

    /**
     * Muestra instrucciones según la plataforma
     */
    showPlatformInstructions() {
        const platformHint = document.getElementById(APP_CONFIG.install.platformHintId);
        if (!platformHint) return;

        const platform = detectPlatform();
        const platformType = getPlatformType();

        // Seleccionar mensaje apropiado
        let message = APP_CONFIG.messages.default;

        if (platform.isAndroid && platform.isChrome) {
            message = APP_CONFIG.messages.android;
        } else if (platform.isIOS) {
            message = APP_CONFIG.messages.ios;
            // Auto-seleccionar tab de iOS
            this.selectIOSTab();
        } else {
            message = APP_CONFIG.messages.desktop;
        }

        platformHint.innerHTML = `<strong>${message}</strong>`;
    }

    /**
     * Selecciona automáticamente el tab de iOS
     */
    selectIOSTab() {
        const iosTab = document.querySelector('[data-tab="ios"]');
        if (iosTab) {
            setTimeout(() => iosTab.click(), 100);
        }
    }
}

// Exportar instancia única (Singleton)
export const pwaInstaller = new PWAInstaller();
