/**
 * Clinical Services Microservice Module
 */
const serviceRoutes = require('../../routes/serviceRoutes');

module.exports = {
    serviceName: 'Clinical Services Catalog',
    basePath: '/api/services',
    router: serviceRoutes
};
