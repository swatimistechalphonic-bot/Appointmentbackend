/**
 * Discharge Summary Microservice Module
 */
const dischargeSummaryRoutes = require('../../routes/dischargeSummaryRoutes');

module.exports = {
    serviceName: 'Discharge Summary Service',
    basePath: '/api/discharge-summaries',
    router: dischargeSummaryRoutes
};
