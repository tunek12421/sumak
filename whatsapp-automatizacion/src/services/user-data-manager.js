// Servicio de gestión de datos del usuario
const { CONVERSATION_STATES } = require('../../config/constants');

class UserDataManager {
    constructor() {
        this.userDataCollection = new Map();
    }

    getUserData(phoneNumber) {
        return this.userDataCollection.get(phoneNumber) || {
            state: CONVERSATION_STATES.INITIAL,
            nombreCompleto: null,
            telefono: null,
            consultaOriginal: null,
            departamentoAsignado: null
        };
    }

    updateUserData(phoneNumber, updates) {
        const currentData = this.getUserData(phoneNumber);
        const updatedData = { ...currentData, ...updates };
        this.userDataCollection.set(phoneNumber, updatedData);
        return updatedData;
    }

    deleteUserData(phoneNumber) {
        this.userDataCollection.delete(phoneNumber);
    }

    parseUserData(message) {
        const text = message.trim();
        
        // Separar por líneas primero
        const lines = text.split('\n').map(line => line.trim()).filter(line => line);
        
        if (lines.length >= 2) {
            return {
                nombreCompleto: lines[0],
                telefono: lines[1],
                valid: true
            };
        }
        
        // Intentar con separadores comunes
        const separators = [',', '|', ';', '-'];
        for (const sep of separators) {
            if (text.includes(sep)) {
                const parts = text.split(sep).map(p => p.trim()).filter(p => p);
                if (parts.length >= 2) {
                    return {
                        nombreCompleto: parts[0],
                        telefono: parts[1],
                        valid: true
                    };
                }
            }
        }
        
        // Si no puede separar claramente
        const words = text.split(' ').filter(w => w);
        if (words.length >= 3) {
            // Buscar número de teléfono
            const phoneIndex = words.findIndex(w => /\d{7,}/.test(w));
            if (phoneIndex !== -1) {
                return {
                    nombreCompleto: words.slice(0, phoneIndex).join(' '),
                    telefono: words[phoneIndex],
                    valid: true
                };
            }
        }
        
        return { valid: false };
    }
}

module.exports = UserDataManager;
