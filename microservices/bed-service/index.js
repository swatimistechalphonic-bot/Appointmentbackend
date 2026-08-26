/**
 * Bed Management Microservice Module
 */
const bedRoutes = require('../../routes/bedRoutes');

module.exports = {
    serviceName: 'Bed & Ward Management Service',
    basePath: '/api/beds',
    router: bedRoutes
};
