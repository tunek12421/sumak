// Validador de reportes de baches usando IA
const OpenAI = require('openai');

class PotholeValidator {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }

    /**
     * Valida si la descripción corresponde a un reporte de bache
     * @param {string} description - Descripción del reporte del usuario
     * @returns {Promise<{isValid: boolean, reason?: string}>}
     */
    async validatePotholeReport(description) {
        try {
            const response = await this.openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: `Eres un clasificador de reportes ciudadanos. Tu tarea es determinar si una descripción corresponde a un reporte de BACHE en la calle/carretera.

Un BACHE válido incluye:
- Huecos o hundimientos en calles, avenidas o carreteras
- Deterioro del pavimento o asfalto
- Problemas en la superficie de rodadura
- Daños en el pavimento que afectan el tránsito

NO son baches:
- Basura o acumulación de residuos
- Problemas de alumbrado público
- Animales callejeros
- Problemas de alcantarillado o drenaje (a menos que hayan causado un bache)
- Árboles caídos
- Problemas de señalización
- Otros problemas urbanos no relacionados con el pavimento

Responde ÚNICAMENTE con un objeto JSON en este formato:
{"isValid": true} si es un reporte de bache
{"isValid": false, "reason": "breve razón"} si NO es un reporte de bache

Ejemplos:
"Hay un bache grande en la Av. América" -> {"isValid": true}
"Basura acumulada en la esquina" -> {"isValid": false, "reason": "Es un reporte de basura, no de bache"}
"La calle está hundida por una fuga de agua" -> {"isValid": true}
"Hay un perro muerto en la calle" -> {"isValid": false, "reason": "No es un problema de pavimento"}`
                    },
                    {
                        role: "user",
                        content: description
                    }
                ],
                temperature: 0.3,
                max_tokens: 150
            });

            const result = response.choices[0].message.content.trim();

            // Intentar parsear la respuesta JSON
            try {
                const parsed = JSON.parse(result);
                return {
                    isValid: parsed.isValid === true,
                    reason: parsed.reason || null
                };
            } catch (parseError) {
                console.error('Error parseando respuesta de OpenAI:', result);
                // En caso de error, ser permisivo y aceptar el reporte
                return { isValid: true };
            }

        } catch (error) {
            console.error('Error validando con OpenAI:', error.message);
            // En caso de error de API, ser permisivo y aceptar el reporte
            return { isValid: true };
        }
    }
}

module.exports = PotholeValidator;
