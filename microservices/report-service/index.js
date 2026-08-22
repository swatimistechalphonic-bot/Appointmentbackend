/**
 * Reports & Analytics Microservice Module
 */
const reportRoutes = require('../../routes/reportRoutes');

module.exports = {
    serviceName: 'Reports & Clinical Analytics Service',
    basePath: '/api/reports',
    router: reportRoutes
};
