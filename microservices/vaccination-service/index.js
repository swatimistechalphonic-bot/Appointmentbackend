/**
 * Vaccination & Immunization Microservice Module
 */
const vaccinationRoutes = require('../../routes/vaccinationRoutes');

module.exports = {
    serviceName: 'Vaccination & Immunization Service',
    basePath: '/api/vaccinations',
    router: vaccinationRoutes
};
