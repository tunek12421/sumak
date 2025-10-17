// Manejador principal de mensajes
const { CONVERSATION_STATES, LIMITES, GREETING_KEYWORDS } = require('../../config/constants');
const { calculateReadTime, calculateTypingTime, getRandomElement } = require('../utils/timing-utils');
const { SALUDOS } = require('../../config/constants');
const {
    generateInitialMessage,
    generateLocationRequestMessage,
    generatePhotoRequestMessage,
    generateSuccessMessage,
    generateErrorMessage,
    generateInvalidPotholeMessage
} = require('./message-generator');
const BackendService = require('./backend-service');
const PotholeValidator = require('./pothole-validator');

class MessageHandler {
    constructor(userDataManager, rateLimiter) {
        this.userDataManager = userDataManager;
        this.rateLimiter = rateLimiter;
        this.backendService = new BackendService();
        this.potholeValidator = new PotholeValidator();
        this.monitor = null;
    }

    setMonitor(monitor) {
        this.monitor = monitor;
    }

    /**
     * Verifica si el mensaje es un saludo inicial
     * @param {string} text - Texto del mensaje
     * @returns {boolean}
     */
    isGreeting(text) {
        const normalizedText = text.toLowerCase().trim();
        return GREETING_KEYWORDS.some(keyword => normalizedText === keyword || normalizedText.includes(keyword));
    }

    async handleMessage(message, chat, client) {
        const phoneNumber = message.from;
        const messageText = message.body?.trim() || '';

        // Obtener datos actuales del usuario
        let userData = this.userDataManager.getUserData(phoneNumber);

        // Simular tiempo de lectura natural
        const readTime = calculateReadTime(messageText || 'mensaje');
        console.log(`   👀 Leyendo mensaje: ${Math.round(readTime)}ms`);
        await new Promise(resolve => setTimeout(resolve, readTime));

        // Procesar según el estado de la conversación
        if (userData.state === CONVERSATION_STATES.INITIAL) {
            await this.handleInitialState(message, chat, phoneNumber, messageText, userData);
        } else if (userData.state === CONVERSATION_STATES.WAITING_LOCATION) {
            await this.handleWaitingLocationState(message, chat, phoneNumber, userData);
        } else if (userData.state === CONVERSATION_STATES.WAITING_PHOTO) {
            await this.handleWaitingPhotoState(message, chat, phoneNumber, userData);
        } else {
            await this.handleUnknownState(message, phoneNumber);
        }

        // Registrar actividad en monitor
        if (this.monitor) {
            this.monitor.logActivity('message_sent', {
                from: phoneNumber,
                state: userData.state,
                responseTime: Date.now() - message.timestamp * 1000
            });
        }

        // Incrementar contador diario
        this.rateLimiter.incrementDailyCount();
        console.log(`   📊 Mensajes hoy: ${this.rateLimiter.getDailyCount()}/${LIMITES.MAX_MESSAGES_PER_DAY}`);
        console.log(`   📋 Estado conversación: ${userData.state}`);
    }

    async handleInitialState(message, chat, phoneNumber, messageText, userData) {
        // Verificar si es un saludo inicial
        if (this.isGreeting(messageText)) {
            console.log('   👋 Saludo inicial detectado');
            const response = generateInitialMessage();
            await this.sendTypingResponse(chat, message, response);
            return;
        }

        console.log('   📝 Estado INITIAL: Validando descripción del reporte');

        // Validar que sea un reporte de bache usando IA
        console.log('   🤖 Validando con IA si es un reporte de bache...');
        const validation = await this.potholeValidator.validatePotholeReport(messageText);

        if (!validation.isValid) {
            console.log('   ❌ Reporte rechazado: No es un bache');
            console.log(`   📝 Razón: ${validation.reason || 'No especificada'}`);

            const response = generateInvalidPotholeMessage(validation.reason);
            await this.sendTypingResponse(chat, message, response);

            // No guardar datos, mantener el estado INITIAL para que pueda intentar de nuevo
            return;
        }

        console.log('   ✅ Validación exitosa: Es un reporte de bache');

        // Guardar la descripción
        userData = this.userDataManager.updateUserData(phoneNumber, {
            state: CONVERSATION_STATES.WAITING_LOCATION,
            description: messageText
        });

        const response = generateLocationRequestMessage();
        await this.sendTypingResponse(chat, message, response);
    }

    async handleWaitingLocationState(message, chat, phoneNumber, userData) {
        console.log('   📍 Estado WAITING_LOCATION: Procesando ubicación');

        // Verificar si el mensaje tiene ubicación
        if (message.location) {
            const { latitude, longitude } = message.location;
            console.log(`   ✅ Ubicación recibida: ${latitude}, ${longitude}`);

            userData = this.userDataManager.updateUserData(phoneNumber, {
                state: CONVERSATION_STATES.WAITING_PHOTO,
                latitude: latitude,
                longitude: longitude
            });

            const response = generatePhotoRequestMessage();
            await this.sendTypingResponse(chat, message, response);
        } else {
            // Si no tiene ubicación, pedir que la envíe
            const response = '❌ No recibí tu ubicación. Por favor, usa el botón de adjuntar (📎) → Ubicación para compartir tu ubicación.';
            await this.sendTypingResponse(chat, message, response);
        }
    }

    async handleWaitingPhotoState(message, chat, phoneNumber, userData) {
        console.log('   📷 Estado WAITING_PHOTO: Procesando foto');

        // Verificar si el mensaje tiene imagen
        if (message.hasMedia) {
            try {
                console.log('   ⏳ Descargando imagen...');
                const media = await message.downloadMedia();

                if (media && media.mimetype.startsWith('image/')) {
                    console.log('   🔄 Convirtiendo imagen a Base64...');
                    const photoBase64 = await this.backendService.convertImageToBase64(media);

                    // Preparar datos para el backend
                    const reportData = {
                        description: userData.description,
                        latitude: userData.latitude,
                        longitude: userData.longitude,
                        photo: photoBase64
                    };

                    console.log('   📤 Enviando reporte al backend...');
                    const result = await this.backendService.createReport(reportData);

                    if (result.success) {
                        const response = generateSuccessMessage(result.data.id);
                        await this.sendTypingResponse(chat, message, response);

                        // Limpiar datos del usuario
                        this.userDataManager.deleteUserData(phoneNumber);
                    } else {
                        const response = generateErrorMessage();
                        await this.sendTypingResponse(chat, message, response);

                        // Limpiar datos para reiniciar
                        this.userDataManager.deleteUserData(phoneNumber);
                    }
                } else {
                    const response = '❌ El archivo no es una imagen válida. Por favor, envía una foto.';
                    await this.sendTypingResponse(chat, message, response);
                }
            } catch (error) {
                console.error('   ❌ Error procesando imagen:', error);
                const response = generateErrorMessage();
                await this.sendTypingResponse(chat, message, response);

                // Limpiar datos para reiniciar
                this.userDataManager.deleteUserData(phoneNumber);
            }
        } else {
            // Si no tiene imagen, pedir que la envíe
            const response = '❌ No recibí ninguna foto. Por favor, envía una imagen del problema.';
            await this.sendTypingResponse(chat, message, response);
        }
    }

    async handleUnknownState(message, phoneNumber) {
        console.log('   🔄 Estado desconocido, reiniciando conversación');
        this.userDataManager.deleteUserData(phoneNumber);
        await message.reply(`${getRandomElement(SALUDOS)} ${generateInitialMessage()}`);
    }

    async sendTypingResponse(chat, message, response) {
        await chat.sendStateTyping();
        const typingTime = calculateTypingTime(response.length);
        console.log(`   ⌨️ Escribiendo respuesta (${response.length} chars): ${Math.round(typingTime)}ms`);
        await new Promise(resolve => setTimeout(resolve, typingTime));
        await message.reply(response);
    }
}

module.exports = MessageHandler;
