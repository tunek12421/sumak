// Configuración de constantes del sistema

// Estados de conversación
const CONVERSATION_STATES = {
    INITIAL: 'initial',
    WAITING_LOCATION: 'waiting_location',
    WAITING_PHOTO: 'waiting_photo',
    READY_TO_SUBMIT: 'ready_to_submit'
};

// Delays naturales para parecer humano
const DELAYS = {
    MIN_RESPONSE_TIME: 2000,  // 2 segundos mínimo
    MAX_RESPONSE_TIME: 8000,  // 8 segundos máximo
    READ_TIME_PER_CHAR: 60,   // 60ms por carácter
    MIN_READ_TIME: 1000,      // Mínimo 1 segundo leyendo
    MAX_READ_TIME: 4000,      // Máximo 4 segundos leyendo
    TYPING_BASE: 2000,        // Base de escritura: 2 segundos
    TYPING_PER_CHAR: 30,      // 30ms por carácter de respuesta
    MIN_TYPING_TIME: 2000,    // Mínimo 2 segundos escribiendo
    MAX_TYPING_TIME: 6000,    // Máximo 6 segundos escribiendo
};

// Límites anti-bloqueo
const LIMITES = {
    MAX_MESSAGES_PER_DAY: 200,     // Límite diario total
    MAX_MESSAGES_PER_HOUR: 50,     // Máximo por hora
    MAX_MESSAGES_PER_NUMBER: 10,   // Máximo por usuario en 1 hora
};

// Mensajes variados para parecer más natural
const SALUDOS = [
    "Hola! 👋",
    "¡Hola! 😊",
    "¡Buen día!",
    "¡Hola, bienvenido/a!"
];

// Palabras clave para detectar saludos de inicio
const GREETING_KEYWORDS = [
    'hola',
    'buenos dias',
    'buenas tardes',
    'buenas noches',
    'buen dia',
    'buena tarde',
    'buena noche',
    'saludos',
    'inicio',
    'iniciar',
    'empezar',
    'comenzar',
    'menu',
    'menú',
    'ayuda',
    'help'
];

const TRANSICIONES = [
    "He analizado tu consulta y",
    "Según tu mensaje,",
    "Por lo que veo,",
    "De acuerdo a tu consulta,"
];

// Backend API Configuration
const BACKEND_CONFIG = {
    BASE_URL: process.env.BACKEND_URL || 'https://zta.148.230.91.96.nip.io',
    REPORTS_ENDPOINT: '/api/reports'
};

module.exports = {
    CONVERSATION_STATES,
    DELAYS,
    LIMITES,
    SALUDOS,
    GREETING_KEYWORDS,
    TRANSICIONES,
    BACKEND_CONFIG
};
