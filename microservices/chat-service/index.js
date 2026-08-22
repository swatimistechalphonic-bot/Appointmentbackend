/**
 * Real-Time Consultation Chat Microservice Module
 */
const chatRoutes = require('../../routes/chatRoutes');

module.exports = {
    serviceName: 'Real-Time Consultation Chat Service',
    basePath: '/api/chat',
    router: chatRoutes
};
