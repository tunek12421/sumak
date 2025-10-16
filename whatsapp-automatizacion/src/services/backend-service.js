// Servicio para comunicarse con el backend

const { BACKEND_CONFIG } = require('../../config/constants');

class BackendService {
    constructor() {
        this.baseUrl = BACKEND_CONFIG.BASE_URL;
        this.reportsEndpoint = BACKEND_CONFIG.REPORTS_ENDPOINT;
    }

    async createReport(reportData) {
        const url = `${this.baseUrl}${this.reportsEndpoint}`;

        console.log(`   📤 Enviando reporte al backend: ${url}`);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reportData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Backend error ${response.status}: ${errorData.error || 'Unknown error'}`);
            }

            const result = await response.json();
            console.log(`   ✅ Reporte creado exitosamente. ID: ${result.id}`);

            return {
                success: true,
                data: result
            };

        } catch (error) {
            console.error(`   ❌ Error al enviar reporte al backend:`, error.message);

            return {
                success: false,
                error: error.message
            };
        }
    }

    async convertImageToBase64(media) {
        try {
            const buffer = await media.data;
            const base64 = buffer.toString('base64');
            const mimeType = media.mimetype || 'image/jpeg';

            return `data:${mimeType};base64,${base64}`;
        } catch (error) {
            console.error('   ❌ Error convirtiendo imagen a Base64:', error);
            throw error;
        }
    }
}

module.exports = BackendService;
