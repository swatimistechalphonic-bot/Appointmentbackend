/**
 * Appointment & Consultations Microservice Module
 */
const appointmentRoutes = require('../../routes/appointmentRoutes');

module.exports = {
    serviceName: 'Appointment Booking & Consultations Service',
    basePath: '/api/appointments',
    router: appointmentRoutes
};
