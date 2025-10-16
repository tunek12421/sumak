// start.js - Script para iniciar el bot de WhatsApp

console.log('🚀 Iniciando Sistema de WhatsApp...\n');

// Iniciar bot de WhatsApp
console.log('📱 Iniciando Bot de WhatsApp...');
require('./bot.js');

// Manejar cierre
process.on('SIGINT', () => {
    console.log('\n👋 Cerrando el bot...');
    process.exit();
});
