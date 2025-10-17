// Generador de mensajes para el bot
const { SALUDOS } = require('../../config/constants');
const { getRandomElement } = require('../utils/timing-utils');

function generateInitialMessage() {
    const saludo = getRandomElement(SALUDOS);

    return `${saludo} Bienvenido al sistema de reportes de **baches**.

📝 Para registrar tu reporte de bache, necesito que me cuentes:

**¿Dónde está el bache y qué tan grave es?**

Por favor, descríbeme el bache con el mayor detalle posible.

💡 Ejemplo:
\`\`\`
Bache grande en la Av. América esquina 6 de Agosto, muy profundo y peligroso
\`\`\``;
}

function generateLocationRequestMessage() {
    return `📍 Perfecto. Ahora necesito saber dónde está ubicado el bache.

Por favor, **comparte tu ubicación** usando el botón de adjuntar (📎) → Ubicación.

💡 Puedes enviar:
• Tu ubicación actual (si estás junto al bache)
• La ubicación exacta del bache en el mapa`;
}

function generatePhotoRequestMessage() {
    return `📷 Excelente. Por último, necesito una foto del bache.

Por favor, envía una **foto** que muestre claramente el bache.

💡 Consejo: Toma una foto clara y bien iluminada donde se vea el tamaño y profundidad del bache.`;
}

function generateSuccessMessage(reportId) {
    return `✅ **¡Reporte de bache registrado exitosamente!**

📋 ID del reporte: \`${reportId}\`

Tu reporte de bache ha sido enviado al sistema municipal y será atendido a la brevedad posible.

¡Gracias por ayudarnos a mantener las calles en buen estado! 🛣️

---
Si deseas reportar otro bache, simplemente escribe "hola" para comenzar de nuevo.`;
}

function generateErrorMessage() {
    return `❌ **Hubo un problema al registrar tu reporte de bache.**

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

function generateInvalidPotholeMessage(reason) {
    return `⚠️ **Este no parece ser un reporte de bache.**

${reason ? `📝 Razón: ${reason}` : ''}

Este sistema está diseñado específicamente para reportar **baches** (huecos o deterioros en el pavimento de calles y avenidas).

💡 Si deseas reportar un bache, por favor escribe "hola" y descríbelo correctamente.

📞 Para otros tipos de reportes ciudadanos, comunícate con la Alcaldía/Gobernación:
👉 https://wa.me/59161561515`;
}

module.exports = {
    generateInitialMessage,
    generateLocationRequestMessage,
    generatePhotoRequestMessage,
    generateSuccessMessage,
    generateErrorMessage,
    generarMensajeHorarioAtencion,
    generarMensajeRateLimitExcedido,
    generateInvalidPotholeMessage
};
