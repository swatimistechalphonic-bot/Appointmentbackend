require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5007;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/appointment_notification_db';

app.use(cors());
app.use(express.json());

// ── Connect DB ───────────────────────────────────────────────────────────────
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Notification Service connected to MongoDB'))
  .catch((err) => console.error('❌ Notification Service DB Connection Error:', err.message));

// ── Notification Log Schema ───────────────────────────────────────────────────
const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: { type: String, enum: ['Email', 'SMS', 'Push'], default: 'Email' },
  recipient: { type: String, required: true },
  subject: { type: String, default: '' },
  message: { type: String, required: true },
  status: { type: String, enum: ['sent', 'failed', 'queued'], default: 'sent' },
  organizationId: { type: String, default: null }
}, { timestamps: true });

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    service: 'Notification Service',
    status: 'UP',
    port: PORT,
    database: mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED',
    timestamp: new Date().toISOString()
  });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/api/notifications', async (req, res) => {
  try {
    const { userId, organizationId } = req.query;
    const filter = {};
    if (userId) filter.userId = userId;
    if (organizationId) filter.organizationId = organizationId;

    const notifications = await Notification.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: notifications.length, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/notifications/send', async (req, res) => {
  try {
    const { userId, type, recipient, subject, message, organizationId } = req.body;
    if (!userId || !recipient || !message) {
      return res.status(400).json({ success: false, message: 'userId, recipient, and message are required.' });
    }

    const notification = await Notification.create({
      userId,
      type: type || 'Email',
      recipient,
      subject: subject || 'CareSync Notification',
      message,
      status: 'sent',
      organizationId: organizationId || null
    });

    console.log(`[Notification Service] 📧 Notification sent to ${recipient}: ${subject}`);
    res.status(201).json({ success: true, message: 'Notification sent successfully!', data: notification });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Notification Service running independently on port ${PORT}`);
  });
}

module.exports = app;
