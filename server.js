require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const connectDB = require('./db');
const userRoutes = require('./routes/userRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

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
                url: `http://localhost:${process.env.PORT || 5000}`,
            },
        ],
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

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);

// Default Route
app.get('/', (req, res) => {
    res.json({ message: 'Appointment Backend API is running successfully!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📑 Swagger UI available at http://localhost:${PORT}/api-docs`);
});

