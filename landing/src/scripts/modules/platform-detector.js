/**
 * Platform Detector Module
 * Detecta la plataforma del usuario y muestra instrucciones apropiadas
 */

/**
 * Detecta la plataforma del usuario
 * @returns {Object} Información de la plataforma
 */
export function detectPlatform() {
    const userAgent = navigator.userAgent.toLowerCase();

    const isAndroid = /android/.test(userAgent);
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isChrome = /chrome/.test(userAgent) && !/edge/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
    const isDesktop = !isAndroid && !isIOS;

    return {
        isAndroid,
        isIOS,
        isChrome,
        isSafari,
        isDesktop
    };
}

/**
 * Obtiene el tipo de plataforma como string
 * @returns {string} 'android', 'ios', 'desktop'
 */
export function getPlatformType() {
    const platform = detectPlatform();

    if (platform.isAndroid) return 'android';
    if (platform.isIOS) return 'ios';
    return 'desktop';
}

/**
 * Verifica si la plataforma soporta PWA
 * @returns {boolean}
 */
export function supportsPWA() {
    return 'serviceWorker' in navigator;
}
