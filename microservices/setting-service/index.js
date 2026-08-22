/**
 * Dynamic App Logo & Settings Microservice Module
 */
const settingRoutes = require('../../routes/settingRoutes');

module.exports = {
    serviceName: 'Dynamic App Logo & Settings Service',
    basePath: '/api/settings',
    router: settingRoutes
};
