/**
 * Hospital Department Microservice Module
 */
const departmentRoutes = require('../../routes/departmentRoutes');

module.exports = {
    serviceName: 'Hospital Departments & Units Service',
    basePath: '/api/departments',
    router: departmentRoutes
};
