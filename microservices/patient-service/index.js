/**
 * Patient Records Microservice Module
 */
const patientRoutes = require('../../routes/patientRoutes');

module.exports = {
    serviceName: 'Patient Records & Clinical History Service',
    basePath: '/api/patients',
    router: patientRoutes
};
