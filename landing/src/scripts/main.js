/**
 * Main JavaScript Entry Point
 * Punto de entrada de la aplicación
 */

// Importar módulos
import { APP_CONFIG } from './config/app-config.js';
import { detectPlatform, getPlatformType, supportsPWA } from './modules/platform-detector.js';
import { pwaInstaller } from './modules/pwa-installer.js';
import { initQRGenerator } from './modules/qr-generator.js';
import { tabSwitcher } from './modules/tab-switcher.js';
import { renderAllComponents } from './modules/component-renderer.js';
import { logger } from '../utils/logger.js';

/**
 * Inicializa la aplicación
 */
function initApp() {
    logger.log('🚀 SUMAQ Landing Page - Nivel 3');
    logger.log('📱 Platform:', getPlatformType());
    logger.log('✅ PWA Support:', supportsPWA());

    // 1. Renderizar componentes HTML dinámicamente
    renderAllComponents();

    // 2. Inicializar generador de QR (después de renderizar)
    setTimeout(() => {
        initQRGenerator();
    }, 100);

    // 3. PWA Installer se inicializa automáticamente
    // 4. Tab Switcher se inicializa automáticamente

    logger.log('✅ App initialized successfully');
}

// Iniciar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Exportar para debugging
window.SUMAQ = {
    config: APP_CONFIG,
    detectPlatform,
    getPlatformType,
    supportsPWA,
    pwaInstaller,
    tabSwitcher,
    renderAllComponents
};
