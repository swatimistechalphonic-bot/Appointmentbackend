/**
 * Queue Management & Live Token Microservice Module
 */
const queueRoutes = require('../../routes/queueRoutes');

module.exports = {
    serviceName: 'Queue Management & Token Service',
    basePath: '/api/queue',
    router: queueRoutes
};
