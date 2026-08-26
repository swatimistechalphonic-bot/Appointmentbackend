require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const connectDB = require('./db');
const userRoutes = require('./routes/userRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const queueRoutes = require('./routes/queueRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const labRoutes = require('./routes/labRoutes');
const bedRoutes = require('./routes/bedRoutes');
const dischargeSummaryRoutes = require('./routes/dischargeSummaryRoutes');
const vaccinationRoutes = require('./routes/vaccinationRoutes');
const { registerMicroservices } = require('./microservices/gateway');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Swagger Options
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Appointment Booking API',
            version: '1.0.0',
            description: 'API documentation for Appointment Booking application',
        },
        servers: [
            {
                url: process.env.SERVER_URL || 'https://appointmentbackend-9jxe.onrender.com',
                description: 'Production Server (Render)',
            },
            {
                url: `http://localhost:${process.env.PORT || 5000}`,
                description: 'Local Development Server',
            },
            {
                url: '/',
                description: 'Dynamic Current Host',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT Bearer token to authorize and unlock protected API endpoints'
                }
            }
        }
    },
    apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
}, swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Connect to Database
console.log("Mongo URI:", process.env.MONGODB_URI);
connectDB();

// Microservices Gateway API Routes
registerMicroservices(app);

// Core Route Mounts (Fallback & Direct Resolution)
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/labs', labRoutes);
app.use('/api/beds', bedRoutes);
app.use('/api/discharge-summaries', dischargeSummaryRoutes);
app.use('/api/vaccinations', vaccinationRoutes);

// Default Route
app.get('/', (req, res) => {
    res.json({ message: 'Appointment Backend API is running successfully!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📑 Swagger UI available at http://localhost:${PORT}/api-docs`);
});

