/**
 * Content Data
 * Todo el contenido de la landing page centralizado
 */

export const CONTENT = {
    // URLs
    urls: {
        app: 'https://zta.148.230.91.96.nip.io',
        admin: 'https://admin.zta.148.230.91.96.nip.io',
        qrDisplay: 'zta.148.230.91.96.nip.io',
        favicon: 'https://zta.148.230.91.96.nip.io/icon-192.png'
    },

    // Meta Information
    meta: {
        title: 'SUMAQ - Reporta Incidentes en tu Ciudad',
        description: 'Descarga SUMAQ, la app para reportar incidentes con foto y ubicación en Cochabamba.',
        ogTitle: 'SUMAQ - Reporta Incidentes',
        ogDescription: 'Descarga la app y ayuda a mejorar tu ciudad reportando incidentes'
    },

    // Hero Section
    hero: {
        icon: '📱',
        title: 'SUMAQ',
        subtitle: 'Reporta incidentes en tu ciudad',
        description: 'Una aplicación simple y rápida para reportar problemas urbanos con foto y ubicación. Ayuda a mejorar tu comunidad en Cochabamba.',
        buttons: {
            primary: 'Abrir App',
            secondary: '📲 Instalar App'
        },
        hint: '💡 <strong>Tip:</strong> Agrega SUMAQ a tu pantalla de inicio para acceso rápido',
        qr: {
            title: 'Escanea para abrir'
        }
    },

    // Features Section
    features: {
        title: '¿Qué puedes hacer?',
        items: [
            {
                icon: '📷',
                title: 'Toma Fotos',
                description: 'Captura el problema directamente desde tu cámara'
            },
            {
                icon: '📍',
                title: 'Ubicación Automática',
                description: 'GPS automático o selección manual en el mapa'
            },
            {
                icon: '✍️',
                title: 'Agrega Descripción',
                description: 'Describe el incidente con tus propias palabras'
            },
            {
                icon: '📤',
                title: 'Envía Reporte',
                description: 'Envía tu reporte en segundos de forma segura'
            },
            {
                icon: '📱',
                title: 'PWA Instalable',
                description: 'Instala en tu móvil como una app nativa'
            },
            {
                icon: '🔒',
                title: 'Seguro y Privado',
                description: 'Tus datos protegidos con HTTPS'
            }
        ]
    },

    // How To Install Section
    howTo: {
        title: 'Cómo Instalar',
        tabs: [
            {
                id: 'android',
                icon: '🤖',
                label: 'Android',
                active: true
            },
            {
                id: 'ios',
                icon: '🍎',
                label: 'iOS',
                active: false
            },
            {
                id: 'desktop',
                icon: '💻',
                label: 'Escritorio',
                active: false
            }
        ],
        android: {
            steps: [
                {
                    number: 1,
                    title: 'Abre en Chrome',
                    description: 'Visita <strong>zta.148.230.91.96.nip.io</strong> en Chrome para Android'
                },
                {
                    number: 2,
                    title: 'Toca el menú',
                    description: 'Toca los tres puntos (⋮) en la esquina superior derecha'
                },
                {
                    number: 3,
                    title: 'Agregar a pantalla de inicio',
                    description: 'Selecciona "Agregar a pantalla de inicio" o "Instalar app"'
                },
                {
                    number: 4,
                    title: '¡Listo!',
                    description: 'Encuentra el ícono de SUMAQ en tu pantalla de inicio'
                }
            ]
        },
        ios: {
            steps: [
                {
                    number: 1,
                    title: 'Abre en Safari',
                    description: 'Visita <strong>zta.148.230.91.96.nip.io</strong> en Safari (iOS)'
                },
                {
                    number: 2,
                    title: 'Toca Compartir',
                    description: 'Toca el botón de compartir (cuadrado con flecha hacia arriba)'
                },
                {
                    number: 3,
                    title: 'Agregar a pantalla de inicio',
                    description: 'Desplázate y selecciona "Agregar a pantalla de inicio"'
                },
                {
                    number: 4,
                    title: 'Confirma',
                    description: 'Toca "Agregar" en la esquina superior derecha'
                }
            ]
        },
        desktop: {
            steps: [
                {
                    number: 1,
                    title: 'Abre en Chrome/Edge',
                    description: 'Visita <strong>zta.148.230.91.96.nip.io</strong> en Chrome o Edge'
                },
                {
                    number: 2,
                    title: 'Busca el ícono de instalación',
                    description: 'Mira en la barra de direcciones, verás un ícono de instalación (+)'
                },
                {
                    number: 3,
                    title: 'Haz clic en Instalar',
                    description: 'Aparecerá un popup, haz clic en "Instalar"'
                },
                {
                    number: 4,
                    title: 'Usa como app',
                    description: 'SUMAQ se abrirá en una ventana independiente'
                }
            ]
        }
    },

    // CTA Section
    cta: {
        title: '¿Listo para empezar?',
        description: 'Descarga SUMAQ ahora y ayuda a mejorar tu ciudad',
        buttons: {
            primary: 'Abrir SUMAQ',
            secondary: '📲 Instalar en 1 Clic'
        }
    },

    // Footer
    footer: {
        copyright: '© 2025 SUMAQ. Todos los derechos reservados.',
        links: [
            {
                label: 'App',
                url: 'https://zta.148.230.91.96.nip.io'
            },
            {
                label: 'Admin',
                url: 'https://admin-zta.148.230.91.96.nip.io'
            }
        ]
    }
};

export default CONTENT;
