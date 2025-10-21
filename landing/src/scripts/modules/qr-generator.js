/**
 * QR Code Generator Module
 * Genera códigos QR usando QRCode.js
 */

import { APP_CONFIG } from '../config/app-config.js';
import { logger } from '../../utils/logger.js';

/**
 * Genera un código QR
 * @param {string} url - URL para el código QR
 * @param {string} elementId - ID del elemento contenedor
 */
export function generateQRCode(url = APP_CONFIG.appUrl, elementId = APP_CONFIG.qr.elementId) {
    const container = document.getElementById(elementId);

    if (!container) {
        logger.error(`❌ QR container not found: #${elementId}`);
        return;
    }

    // Limpiar contenedor si ya tiene contenido
    container.innerHTML = '';

    try {
        // Generar QR Code
        const qrcode = new QRCode(container, {
            text: url,
            width: APP_CONFIG.qr.size,
            height: APP_CONFIG.qr.size,
            colorDark: APP_CONFIG.qr.colorDark,
            colorLight: APP_CONFIG.qr.colorLight,
            correctLevel: QRCode.CorrectLevel[APP_CONFIG.qr.correctLevel]
        });

        logger.log(`✅ QR Code generated for: ${url}`);
        return qrcode;
    } catch (error) {
        logger.error('❌ Error generating QR Code:', error);
    }
}

/**
 * Inicializa el generador de QR cuando el DOM esté listo
 */
export function initQRGenerator() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => generateQRCode());
    } else {
        generateQRCode();
    }
}
