// Generador de mensajes para el bot
const { SALUDOS } = require('../../config/constants');
const { getRandomElement } = require('../utils/timing-utils');

function generateInitialMessage() {
    const saludo = getRandomElement(SALUDOS);

    return `${saludo} Bienvenido al sistema de reportes ciudadanos.

📝 Para registrar tu reporte, necesito que me cuentes:

**¿Qué problema quieres reportar?**

Por favor, descríbeme la situación con el mayor detalle posible.

💡 Ejemplo:
\`\`\`
Hay basura acumulada en la esquina de la Av. América
\`\`\``;
}

function generateLocationRequestMessage() {
    return `📍 Perfecto. Ahora necesito saber la ubicación del problema.

Por favor, **comparte tu ubicación** usando el botón de adjuntar (📎) → Ubicación.

💡 Puedes enviar:
• Tu ubicación actual (si estás en el lugar)
• La ubicación exacta del problema en el mapa`;
}

function generatePhotoRequestMessage() {
    return `📷 Excelente. Por último, necesito una foto del problema.

Por favor, envía una **foto** que muestre claramente la situación.

💡 Consejo: Toma una foto clara y bien iluminada del problema.`;
}

function generateSuccessMessage(reportId) {
    return `✅ **¡Reporte registrado exitosamente!**

📋 ID del reporte: \`${reportId}\`

Tu reporte ha sido enviado al sistema municipal y será atendido a la brevedad posible.

¡Gracias por contribuir a mejorar nuestra ciudad! 🏙️

---
Si deseas hacer otro reporte, simplemente escribe "hola" para comenzar de nuevo.`;
}

function generateErrorMessage() {
    return `❌ **Hubo un problema al registrar tu reporte.**

Por favor, intenta nuevamente escribiendo "hola" para reiniciar el proceso.

Si el problema persiste, contacta con soporte técnico.`;
}

function generarMensajeHorarioAtencion() {
    const saludo = getRandomElement(SALUDOS);
    return `${saludo} Nuestro horario de atención es:

📅 Lunes a Viernes: 8:00 - 18:00
📅 Sábados: 8:00 - 12:00

Tu mensaje será atendido en el próximo horario hábil. ¡Gracias! 😊`;
}

function generarMensajeRateLimitExcedido() {
    return 'Por favor, espera unos minutos antes de enviar otro mensaje. Gracias por tu comprensión. 🙏';
}

module.exports = {
    generateInitialMessage,
    generateLocationRequestMessage,
    generatePhotoRequestMessage,
    generateSuccessMessage,
    generateErrorMessage,
    generarMensajeHorarioAtencion,
    generarMensajeRateLimitExcedido
};
