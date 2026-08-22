/**
 * Payment Management Microservice Module
 */
const paymentRoutes = require('../../routes/paymentRoutes');

module.exports = {
    serviceName: 'Payment Management Service',
    basePath: '/api/payments',
    router: paymentRoutes
};
