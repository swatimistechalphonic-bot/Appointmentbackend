/**
 * Laboratory Diagnostics Microservice Module
 */
const labRoutes = require('../../routes/labRoutes');

module.exports = {
    serviceName: 'Laboratory & Diagnostics Service',
    basePath: '/api/labs',
    router: labRoutes
};
