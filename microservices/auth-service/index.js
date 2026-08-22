/**
 * Auth & User Profile Microservice Module
 */
const userRoutes = require('../../routes/userRoutes');

module.exports = {
    serviceName: 'Auth & User Profile Service',
    basePath: '/api/users',
    router: userRoutes
};
