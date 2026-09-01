/**
 * Document Repository Microservice Module
 */
const documentRoutes = require('../../routes/documentRoutes');

module.exports = {
    serviceName: 'Document Management Service',
    basePath: '/api/documents',
    router: documentRoutes
};
