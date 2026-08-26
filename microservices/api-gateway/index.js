const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.GATEWAY_PORT || 5000;

app.use(cors());
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { error: 'Too many requests from this IP. Please try again later.' }
});
app.use('/api', limiter);

// Service Registry
const serviceRegistry = {
  auth:           process.env.AUTH_SERVICE_URL           || 'http://localhost:5001',
  users:          process.env.USER_SERVICE_URL           || 'http://localhost:5002',
  organizations:  process.env.ORG_SERVICE_URL            || 'http://localhost:5003',
  appointments:   process.env.APPOINTMENT_SERVICE_URL    || 'http://localhost:5004',
  queue:          process.env.QUEUE_SERVICE_URL          || 'http://localhost:5005',
  prescriptions:  process.env.PRESCRIPTION_SERVICE_URL  || 'http://localhost:5006',
  patients:       process.env.PATIENT_SERVICE_URL        || 'http://localhost:5007',
  doctors:        process.env.DOCTOR_SERVICE_URL         || 'http://localhost:5008',
  schedules:      process.env.SCHEDULE_SERVICE_URL       || 'http://localhost:5009',
  payments:       process.env.PAYMENT_SERVICE_URL        || 'http://localhost:5010',
  billing:        process.env.BILLING_SERVICE_URL        || 'http://localhost:5011',
  notifications:  process.env.NOTIFICATION_SERVICE_URL  || 'http://localhost:5012',
  reports:        process.env.REPORT_SERVICE_URL         || 'http://localhost:5013',
  analytics:      process.env.ANALYTICS_SERVICE_URL     || 'http://localhost:5014',
  subscriptions:  process.env.SUBSCRIPTION_SERVICE_URL  || 'http://localhost:5015',
  audit:          process.env.AUDIT_SERVICE_URL          || 'http://localhost:5016',
  reviews:        process.env.REVIEW_SERVICE_URL         || 'http://localhost:5017',
  chat:           process.env.CHAT_SERVICE_URL           || 'http://localhost:5018',
  telemedicine:   process.env.TELEMEDICINE_SERVICE_URL  || 'http://localhost:5019',
  records:        process.env.RECORD_SERVICE_URL         || 'http://localhost:5020',
};

// Mount Routes to Services
Object.entries(serviceRegistry).forEach(([key, target]) => {
  app.use(`/api/${key}`, createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: { [`^/api/${key}`]: `/api/${key}` },
    on: {
      error: (err, req, res) => {
        console.error(`[Gateway] Proxy Error → ${key}: ${err.message}`);
        res.status(502).json({ success: false, message: `${key} service unavailable.` });
      }
    }
  }));
});

// Health Check
app.get('/health', (req, res) => res.json({
  status: 'OK',
  gateway: 'CareSync API Gateway',
  timestamp: new Date().toISOString(),
  services: Object.keys(serviceRegistry).map(k => ({ name: k, target: serviceRegistry[k] }))
}));

app.use('*', (req, res) => res.status(404).json({ success: false, message: 'Route not found in API Gateway.' }));

app.listen(PORT, () => console.log(`🚀 CareSync API Gateway running on port ${PORT}`));

module.exports = app;
