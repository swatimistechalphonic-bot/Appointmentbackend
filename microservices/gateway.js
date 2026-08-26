/**
 * Microservices API Gateway Router & Service Discovery Engine
 */
const authService = require('./auth-service');
const appointmentService = require('./appointment-service');
const queueService = require('./queue-service');
const prescriptionService = require('./prescription-service');
const patientService = require('./patient-service');
const departmentService = require('./department-service');
const reportService = require('./report-service');
const reviewService = require('./review-service');
const chatService = require('./chat-service');
const settingService = require('./setting-service');
const paymentService = require('./payment-service');
const organizationService = require('./organization-service');
const scheduleService = require('./schedule-service');
const medicalRecordService = require('./medical-record-service');
const telemedicineService = require('./telemedicine-service');
const billingService = require('./billing-service');
const notificationService = require('./notification-service');
const analyticsService = require('./analytics-service');
const subscriptionService = require('./subscription-service');
const auditService = require('./audit-service');
const serviceService = require('./service-service');
const labService = require('./lab-service');
const bedService = require('./bed-service');

const services = [
    authService,
    appointmentService,
    queueService,
    prescriptionService,
    patientService,
    departmentService,
    reportService,
    reviewService,
    chatService,
    settingService,
    paymentService,
    organizationService,
    scheduleService,
    medicalRecordService,
    telemedicineService,
    billingService,
    notificationService,
    analyticsService,
    subscriptionService,
    auditService,
    serviceService,
    labService,
    bedService
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
