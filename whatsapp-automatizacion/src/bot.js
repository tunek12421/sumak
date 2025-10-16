// Sistema de WhatsApp con IA para redirección de consultas ciudadanas
// Versión modularizada
require('dotenv').config();

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Importar servicios
const RateLimiter = require('./services/rate-limiter');
const UserDataManager = require('./services/user-data-manager');
const MessageHandler = require('./services/message-handler');

// Importar generadores de mensajes
const {
    generarMensajeRateLimitExcedido
} = require('./services/message-generator');

// Importar utilidades
const { getRandomDelay } = require('./utils/timing-utils');
const { LIMITES } = require('../config/constants');

// Inicializar servicios
const rateLimiter = new RateLimiter();
const userDataManager = new UserDataManager();
const messageHandler = new MessageHandler(userDataManager, rateLimiter);

// Importar monitor si existe (opcional)
let monitor;
try {
    const WhatsAppMonitor = require('./monitor');
    monitor = new WhatsAppMonitor();
    monitor.start();
    messageHandler.setMonitor(monitor);
    console.log('✅ Monitor inicializado');
} catch (e) {
    console.log('ℹ️  Monitor no configurado (opcional)');
}


// Cliente de WhatsApp con configuración optimizada para WSL
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor'
        ]
    }
});

// Mostrar código QR para autenticación
client.on('qr', (qr) => {
    console.log('Escanea este código QR con WhatsApp:');
    qrcode.generate(qr, { small: true });
});

// Evento de autenticación exitosa
client.on('authenticated', () => {
    console.log('✅ Autenticación exitosa!');
});

// Evento de carga
client.on('loading_screen', (percent, message) => {
    console.log(`⏳ Cargando: ${percent}% - ${message}`);
});

// Cliente listo
client.on('ready', () => {
    console.log('✅ Cliente de WhatsApp conectado y listo!');
    console.log('📱 Esperando mensajes...\n');
});

// Manejo de mensajes con medidas anti-bloqueo
client.on('message', async (message) => {
    // Ignorar mensajes propios y de grupos
    if (message.fromMe || message.from.includes('@g.us')) return;

    // Ignorar mensajes vacíos (pero no los que tienen media/ubicación)
    if (!message.body && !message.hasMedia && !message.location) {
        console.log('⚠️ Mensaje vacío ignorado');
        return;
    }

    console.log(`\n📨 Nuevo mensaje de ${message.from}:`);
    console.log(`   Mensaje: "${message.body}"`);

    try {
        // Verificar límite diario
        if (!rateLimiter.checkDailyLimit()) {
            console.log('⚠️ Límite diario alcanzado (seguridad)');
            return;
        }
        
        // Verificar límite por usuario
        if (!rateLimiter.checkRateLimit(message.from)) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            await message.reply(generarMensajeRateLimitExcedido());
            return;
        }

        // Obtener chat
        const chat = await message.getChat();
        
        // Procesar mensaje
        await messageHandler.handleMessage(message, chat, client);

    } catch (error) {
        console.error('❌ Error procesando mensaje:', error);
        
        if (monitor) {
            monitor.logActivity('message_failed', {
                from: message.from,
                error: error.message
            });
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        await message.reply('Disculpa, tuve un problema procesando tu mensaje. Por favor, intenta nuevamente escribiendo "hola" para reiniciar.');
        
        // Limpiar datos en caso de error
        userDataManager.deleteUserData(message.from);
    }
});

// Manejo de errores y desconexión
client.on('auth_failure', (msg) => {
    console.error('❌ Error de autenticación:', msg);
    if (monitor) {
        monitor.createAlert('VERIFICATION_REQUEST', { message: msg });
    }
});

client.on('disconnected', (reason) => {
    console.log('📱 Cliente desconectado:', reason);
    if (monitor && reason === 'CONFLICT') {
        monitor.createAlert('CONNECTION_LOST', { reason });
    }
});

// Inicializar cliente
console.log('🚀 Iniciando sistema de WhatsApp con IA...');
console.log('⚙️  Medidas anti-bloqueo activadas');
console.log(`📊 Límites: ${LIMITES.MAX_MESSAGES_PER_DAY} mensajes/día, ${LIMITES.MAX_MESSAGES_PER_HOUR} mensajes/hora`);
client.initialize();

// Mostrar estadísticas cada hora
setInterval(() => {
    console.log(`\n📊 === ESTADÍSTICAS ===`);
    console.log(`Mensajes hoy: ${rateLimiter.getDailyCount()}/${LIMITES.MAX_MESSAGES_PER_DAY}`);
    console.log(`Usuarios activos: ${rateLimiter.getActiveUsersCount()}`);
    console.log(`Hora: ${new Date().toLocaleTimeString('es-BO')}`);
    console.log(`===================\n`);
}, 3600000); // Cada hora

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n👋 Cerrando aplicación...');
    console.log(`📊 Total mensajes procesados hoy: ${rateLimiter.getDailyCount()}`);
    await client.destroy();
    process.exit();
});
