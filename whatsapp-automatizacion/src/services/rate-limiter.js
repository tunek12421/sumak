// Servicio de control de límites y anti-bloqueo
const { LIMITES } = require('../../config/constants');

class RateLimiter {
    constructor() {
        this.rateLimiter = new Map();
        this.dailyMessageCount = 0;
        this.lastResetDate = new Date().toDateString();
    }

    checkDailyLimit() {
        const today = new Date().toDateString();
        if (today !== this.lastResetDate) {
            this.dailyMessageCount = 0;
            this.lastResetDate = today;
            this.rateLimiter.clear();
        }
        return this.dailyMessageCount < LIMITES.MAX_MESSAGES_PER_DAY;
    }

    checkRateLimit(phoneNumber) {
        const now = Date.now();
        const userRecord = this.rateLimiter.get(phoneNumber) || { messages: [], hourlyCount: 0 };
        
        // Limpiar mensajes antiguos (más de 1 hora)
        userRecord.messages = userRecord.messages.filter(time => now - time < 3600000);
        
        // Verificar límites
        if (userRecord.messages.length >= LIMITES.MAX_MESSAGES_PER_NUMBER) {
            console.log(`⚠️ Usuario ${phoneNumber} excedió límite por hora`);
            return false;
        }
        
        // Actualizar registro
        userRecord.messages.push(now);
        this.rateLimiter.set(phoneNumber, userRecord);
        return true;
    }

    incrementDailyCount() {
        this.dailyMessageCount++;
    }

    getDailyCount() {
        return this.dailyMessageCount;
    }

    getActiveUsersCount() {
        return this.rateLimiter.size;
    }

    isBusinessHours() {
        const now = new Date();
        const hour = now.getHours();
        const day = now.getDay();
        
        // Lunes a Viernes, 8:00 - 18:00
        // Sábados, 8:00 - 12:00
        if (day >= 1 && day <= 5 && hour >= 8 && hour < 18) return true;
        if (day === 6 && hour >= 8 && hour < 12) return true;
        return false;
    }
}

module.exports = RateLimiter;
