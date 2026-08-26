/**
 * Digital Prescriptions & Rx Referrals Microservice Module
 */
const prescriptionRoutes = require('../../routes/prescriptionRoutes');

module.exports = {
    serviceName: 'Digital Prescriptions & Rx Service',
    basePath: '/api/prescriptions',
    router: prescriptionRoutes
};
