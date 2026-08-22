/**
 * Doctor Reviews & Ratings Microservice Module
 */
const reviewRoutes = require('../../routes/reviewRoutes');

module.exports = {
    serviceName: 'Doctor Reviews & Ratings Service',
    basePath: '/api/reviews',
    router: reviewRoutes
};
