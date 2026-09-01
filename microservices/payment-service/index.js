require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5006;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/appointment_payment_db';

app.use(cors());
app.use(express.json());

// ── Connect DB ───────────────────────────────────────────────────────────────
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Payment Service connected to MongoDB'))
  .catch((err) => console.error('❌ Payment Service DB Connection Error:', err.message));

// ── Payment Schema ────────────────────────────────────────────────────────────
const paymentSchema = new mongoose.Schema({
  appointmentId: { type: String, required: true },
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  paymentMethod: { type: String, enum: ['Card', 'UPI', 'NetBanking', 'Cash'], default: 'UPI' },
  transactionId: { type: String, required: true, unique: true },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'completed' },
  organizationId: { type: String, default: null }
}, { timestamps: true });

const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    service: 'Payment Service',
    status: 'UP',
    port: PORT,
    database: mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED',
    timestamp: new Date().toISOString()
  });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/api/payments', async (req, res) => {
  try {
    const { userId, appointmentId, organizationId } = req.query;
    const filter = {};
    if (userId) filter.userId = userId;
    if (appointmentId) filter.appointmentId = appointmentId;
    if (organizationId) filter.organizationId = organizationId;

    const payments = await Payment.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: payments.length, data: payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/payments/process', async (req, res) => {
  try {
    const { appointmentId, userId, amount, paymentMethod, organizationId } = req.body;
    if (!appointmentId || !userId || !amount) {
      return res.status(400).json({ success: false, message: 'appointmentId, userId, and amount are required.' });
    }

    const transactionId = 'TXN_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

    const payment = await Payment.create({
      appointmentId,
      userId,
      amount,
      paymentMethod: paymentMethod || 'UPI',
      transactionId,
      status: 'completed',
      organizationId: organizationId || null
    });

    res.status(201).json({ success: true, message: 'Payment processed successfully!', data: payment });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Payment Service running independently on port ${PORT}`);
  });
}

module.exports = app;
