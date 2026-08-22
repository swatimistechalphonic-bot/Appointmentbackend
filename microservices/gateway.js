/**
 * Microservices API Gateway Router & Service Discovery Engine
 */
const authService = require('./auth-service');
const appointmentService = require('./appointment-service');
const patientService = require('./patient-service');
const departmentService = require('./department-service');
const reportService = require('./report-service');
const reviewService = require('./review-service');

const services = [
    authService,
    appointmentService,
    patientService,
    departmentService,
    reportService,
    reviewService
];

const registerMicroservices = (app) => {
    console.log('🌐 Registering Microservices Gateway...');
    services.forEach(svc => {
        app.use(svc.basePath, svc.router);
        console.log(`  ✓ Loaded Microservice: [${svc.serviceName}] at path ${svc.basePath}`);
    });
};

module.exports = {
    registerMicroservices,
    services
};
