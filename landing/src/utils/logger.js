/**
 * Logger Utility
 * Solo muestra logs en desarrollo
 */

// Detectar si estamos en desarrollo
const isDevelopment = window.location.hostname === 'localhost' ||
                      window.location.hostname === '127.0.0.1' ||
                      window.location.port !== '';

/**
 * Logger que solo funciona en desarrollo
 */
export const logger = {
    log: (...args) => {
        if (isDevelopment) {
            console.log(...args);
        }
    },

    warn: (...args) => {
        if (isDevelopment) {
            console.warn(...args);
        }
    },

    error: (...args) => {
        // Los errores siempre se muestran
        console.error(...args);
    },

    info: (...args) => {
        if (isDevelopment) {
            console.info(...args);
        }
    },

    debug: (...args) => {
        if (isDevelopment) {
            console.debug(...args);
        }
    }
};

export default logger;
