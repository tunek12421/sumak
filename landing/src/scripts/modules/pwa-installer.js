/**
 * PWA Installer Module
 * Maneja la instalación de PWA con detección inteligente de navegadores
 */

import { APP_CONFIG } from '../config/app-config.js';
import { detectPlatform, getPlatformType } from './platform-detector.js';
import { logger } from '../../utils/logger.js';

class PWAInstaller {
    constructor() {
        this.deferredPrompt = null;
        this.installButtons = [];
        this.browserInfo = this.detectBrowser();
        this.init();
    }

    /**
     * Detecta el navegador y plataforma
     */
    detectBrowser() {
        const ua = navigator.userAgent;

        return {
            // Plataforma
            isAndroid: /Android/i.test(ua),
            isIOS: /iPhone|iPad|iPod/i.test(ua),
            isDesktop: !/Android|iPhone|iPad|iPod/i.test(ua),

            // Navegadores
            isChrome: /Chrome/i.test(ua) && !/Edge/i.test(ua),
            isEdge: /Edge|Edg/i.test(ua),
            isSamsung: /SamsungBrowser/i.test(ua),
            isFirefox: /Firefox/i.test(ua),
            isSafari: /Safari/i.test(ua) && !/Chrome/i.test(ua) && !/Edge/i.test(ua),
            isOpera: /Opera|OPR/i.test(ua),

            // Capacidad PWA
            supportsPWA: false // Se actualiza después
        };
    }

    /**
     * Verifica si el navegador soporta instalación automática PWA
     */
    canAutoInstall() {
        const { isAndroid, isDesktop, isChrome, isEdge, isSamsung } = this.browserInfo;

        // Android: Chrome, Edge, Samsung Internet
        if (isAndroid && (isChrome || isEdge || isSamsung)) {
            return true;
        }

        // Desktop: Chrome, Edge
        if (isDesktop && (isChrome || isEdge)) {
            return true;
        }

        return false;
    }

    /**
     * Inicializa el instalador
     */
    init() {
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    /**
     * Configura el instalador
     */
    setup() {
        // Obtener botones de instalación
        APP_CONFIG.install.buttonIds.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                this.installButtons.push(btn);
                btn.addEventListener('click', () => this.handleInstall());
            }
        });

        // Si el navegador soporta instalación automática
        if (this.canAutoInstall()) {
            // Escuchar el evento beforeinstallprompt
            window.addEventListener('beforeinstallprompt', (e) => this.onBeforeInstallPrompt(e));
            this.browserInfo.supportsPWA = true;
        }

        // Mostrar instrucciones según navegador/plataforma
        this.showBrowserInstructions();

        logger.log('🚀 PWA Installer initialized', this.browserInfo);
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
            btn.disabled = false;
        });

        logger.log('✅ Install prompt available');
    }

    /**
     * Maneja el clic en el botón de instalación
     */
    async handleInstall() {
        const { isAndroid, isIOS, isFirefox, isSafari, isChrome, isEdge, isSamsung } = this.browserInfo;

        // Caso 1: Chrome/Edge/Samsung en Android/Desktop (PWA completa)
        if (this.deferredPrompt) {
            await this.installPWA();
            return;
        }

        // Caso 2: Android Firefox
        if (isAndroid && isFirefox) {
            this.showFirefoxInstructions();
            return;
        }

        // Caso 3: iOS Safari
        if (isIOS && isSafari) {
            this.showIOSInstructions();
            return;
        }

        // Caso 4: iOS otros navegadores (Chrome, Firefox, etc.)
        if (isIOS && !isSafari) {
            this.showIOSOpenInSafari();
            return;
        }

        // Caso 5: Navegador no soportado - Redirigir a la app
        logger.warn('⚠️ Browser does not support PWA installation');
        window.location.href = APP_CONFIG.appUrl;
    }

    /**
     * Instala la PWA (Chrome/Edge/Samsung)
     */
    async installPWA() {
        try {
            // Mostrar el prompt de instalación nativo
            this.deferredPrompt.prompt();

            // Esperar respuesta del usuario
            const { outcome } = await this.deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                logger.log('✅ User accepted the install prompt');

                // Opcional: Redirigir a la app después de instalar
                setTimeout(() => {
                    window.location.href = APP_CONFIG.appUrl;
                }, 1000);
            } else {
                logger.log('❌ User dismissed the install prompt');
            }

            // Limpiar el prompt
            this.deferredPrompt = null;

            // Ocultar botones
            this.installButtons.forEach(btn => {
                btn.style.display = 'none';
            });
        } catch (error) {
            logger.error('❌ Error installing PWA:', error);
        }
    }

    /**
     * Muestra instrucciones para Firefox Android
     */
    showFirefoxInstructions() {
        this.showModal({
            title: '🦊 Instalación en Firefox',
            message: `
                <p><strong>Para instalar SUMAQ en Firefox Android:</strong></p>
                <ol style="text-align: left; margin: 1rem 0;">
                    <li>Toca el menú (⋮) en la esquina superior derecha</li>
                    <li>Selecciona "Instalar"</li>
                    <li>Confirma la instalación</li>
                </ol>
                <p>¡Listo! El icono aparecerá en tu pantalla de inicio.</p>
            `,
            buttonText: 'Entendido'
        });
    }

    /**
     * Muestra instrucciones para iOS Safari
     */
    showIOSInstructions() {
        this.showModal({
            title: '🍎 Instalación en iOS',
            message: `
                <p><strong>Para instalar SUMAQ en iOS:</strong></p>
                <ol style="text-align: left; margin: 1rem 0;">
                    <li>Toca el botón de compartir <span style="font-size: 1.2em;">⬆️</span></li>
                    <li>Desplázate y toca "Agregar a pantalla de inicio"</li>
                    <li>Toca "Agregar"</li>
                </ol>
                <p>¡Listo! El icono aparecerá en tu pantalla de inicio.</p>
            `,
            buttonText: 'Entendido'
        });
    }

    /**
     * Instrucciones para abrir en Safari desde otro navegador iOS
     */
    showIOSOpenInSafari() {
        this.showModal({
            title: '🍎 Abre en Safari',
            message: `
                <p><strong>En iOS, solo Safari puede instalar aplicaciones web.</strong></p>
                <p>Por favor:</p>
                <ol style="text-align: left; margin: 1rem 0;">
                    <li>Copia esta URL: <code style="background: #f0f0f0; padding: 0.2rem 0.5rem; border-radius: 4px;">${window.location.href}</code></li>
                    <li>Abre Safari</li>
                    <li>Pega la URL y presiona Enter</li>
                    <li>Sigue las instrucciones de instalación</li>
                </ol>
            `,
            buttonText: 'Copiar URL',
            onButtonClick: () => {
                // Copiar URL al portapapeles
                navigator.clipboard.writeText(window.location.href)
                    .then(() => alert('✅ URL copiada al portapapeles'))
                    .catch(() => logger.error('❌ No se pudo copiar la URL'));
            }
        });
    }

    /**
     * Muestra un modal con instrucciones
     */
    showModal({ title, message, buttonText, onButtonClick }) {
        // Crear modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            padding: 1rem;
        `;

        modal.innerHTML = `
            <div style="
                background: white;
                border-radius: 12px;
                padding: 2rem;
                max-width: 500px;
                width: 100%;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            ">
                <h2 style="margin: 0 0 1rem 0; color: #667eea;">${title}</h2>
                <div style="color: #333; line-height: 1.6;">
                    ${message}
                </div>
                <button id="modalCloseBtn" style="
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    padding: 0.75rem 2rem;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    margin-top: 1.5rem;
                    width: 100%;
                ">
                    ${buttonText}
                </button>
            </div>
        `;

        document.body.appendChild(modal);

        // Manejar click en el botón
        const closeBtn = modal.querySelector('#modalCloseBtn');
        closeBtn.addEventListener('click', () => {
            if (onButtonClick) {
                onButtonClick();
            }
            document.body.removeChild(modal);
        });

        // Cerrar al hacer click fuera del modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    /**
     * Muestra instrucciones según navegador/plataforma
     */
    showBrowserInstructions() {
        const platformHint = document.getElementById(APP_CONFIG.install.platformHintId);
        if (!platformHint) return;

        const { isAndroid, isIOS, isChrome, isEdge, isSamsung, isFirefox, isSafari } = this.browserInfo;

        let message = '';

        if (isAndroid && (isChrome || isEdge || isSamsung)) {
            message = '🤖 Android detectado - ¡Puedes instalar con 2 clicks!';
        } else if (isAndroid && isFirefox) {
            message = '🦊 Firefox detectado - Usa el menú para instalar';
        } else if (isIOS && isSafari) {
            message = '🍎 iOS detectado - Usa el botón Compartir para instalar';
        } else if (isIOS && !isSafari) {
            message = '🍎 iOS detectado - Abre en Safari para instalar';
        } else {
            message = '💡 Visita esta página en Chrome móvil para instalar';
        }

        platformHint.innerHTML = `<strong>${message}</strong>`;
    }
}

// Exportar instancia única (Singleton)
export const pwaInstaller = new PWAInstaller();
