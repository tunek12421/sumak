// Utilidades para simular comportamiento humano (anti-bloqueo)
const { DELAYS } = require('../../config/constants');

function getRandomDelay(min = DELAYS.MIN_RESPONSE_TIME, max = DELAYS.MAX_RESPONSE_TIME) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Calcular tiempo de lectura natural basado en el contenido
function calculateReadTime(message) {
    const baseTime = Math.max(
        message.length * DELAYS.READ_TIME_PER_CHAR,
        DELAYS.MIN_READ_TIME
    );
    
    // Añadir tiempo extra por complejidad
    let complexityBonus = 0;
    if (message.includes('\n')) complexityBonus += 500; // Múltiples líneas
    if (/\d{7,8}/.test(message)) complexityBonus += 300; // Contiene números largos
    if (message.split(' ').length > 5) complexityBonus += 200; // Mensaje largo
    
    const totalTime = Math.min(baseTime + complexityBonus, DELAYS.MAX_READ_TIME);
    return totalTime + Math.random() * 500; // Variación aleatoria
}

// Calcular tiempo de escritura natural basado en la respuesta
function calculateTypingTime(responseLength) {
    const baseTime = Math.max(
        DELAYS.TYPING_BASE + (responseLength * DELAYS.TYPING_PER_CHAR),
        DELAYS.MIN_TYPING_TIME
    );
    
    const totalTime = Math.min(baseTime, DELAYS.MAX_TYPING_TIME);
    return totalTime + Math.random() * 1000; // Variación aleatoria
}

module.exports = {
    getRandomDelay,
    getRandomElement,
    calculateReadTime,
    calculateTypingTime
};
