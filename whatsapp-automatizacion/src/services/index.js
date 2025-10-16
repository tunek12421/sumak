// Punto de entrada para todos los servicios

const ClassificationService = require('./classification-service');
const MessageDeduplicator = require('./message-deduplicator');
const MessageGenerator = require('./message-generator');
const MessageHandler = require('./message-handler');
const NotificationService = require('./notification-service');
const RateLimiter = require('./rate-limiter');
const UserDataManager = require('./user-data-manager');

module.exports = {
    ClassificationService,
    MessageDeduplicator,
    MessageGenerator,
    MessageHandler,
    NotificationService,
    RateLimiter,
    UserDataManager
};
