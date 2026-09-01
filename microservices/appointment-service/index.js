require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { EventEmitter } = require('events');

const app = express();
const PORT = process.env.PORT || 5004;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/appointment_booking_db';

const eventBus = new EventEmitter();

app.use(cors());
app.use(express.json());

// ── Connect DB ───────────────────────────────────────────────────────────────
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Appointment Service connected to MongoDB'))
  .catch((err) => console.error('❌ Appointment Service DB Connection Error:', err.message));

// ── Appointment Schema ────────────────────────────────────────────────────────
const appointmentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  doctorId: { type: String, required: true },
  doctorName: { type: String, required: true },
  specialization: { type: String, required: true },
  date: { type: String, required: true },
  timeSlot: { type: String, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
  reason: { type: String, default: '' },
  amount: { type: Number, default: 500 },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  organizationId: { type: String, default: null }
}, { timestamps: true });

const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    service: 'Appointment Service',
    status: 'UP',
    port: PORT,
    database: mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED',
    timestamp: new Date().toISOString()
  });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/api/appointments', async (req, res) => {
  try {
    const { userId, doctorId, status, organizationId } = req.query;
    const filter = {};
    if (userId) filter.userId = userId;
    if (doctorId) filter.doctorId = doctorId;
    if (status) filter.status = status;
    if (organizationId) filter.organizationId = organizationId;

    const appointments = await Appointment.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/appointments/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, data: appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/appointments', async (req, res) => {
  try {
    const { userId, userName, doctorId, doctorName, specialization, date, timeSlot, reason, amount, organizationId } = req.body;
    if (!userId || !doctorId || !date || !timeSlot) {
      return res.status(400).json({ success: false, message: 'userId, doctorId, date, and timeSlot are required.' });
    }

    const appointment = await Appointment.create({
      userId,
      userName: userName || 'Patient',
      doctorId,
      doctorName: doctorName || 'Doctor',
      specialization: specialization || 'General',
      date,
      timeSlot,
      reason: reason || '',
      amount: amount || 500,
      organizationId: organizationId || null
    });

    // Publish event asynchronously
    eventBus.emit('APPOINTMENT_BOOKED', {
      appointmentId: appointment._id,
      userId,
      doctorId,
      date,
      timeSlot
    });

    res.status(201).json({ success: true, message: 'Appointment booked successfully!', data: appointment });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.put('/api/appointments/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, message: `Status updated to ${status}`, data: appointment });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Appointment Service running independently on port ${PORT}`);
  });
}

module.exports = app;
