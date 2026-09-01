require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5005;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/appointment_schedule_db';

app.use(cors());
app.use(express.json());

// ── Connect DB ───────────────────────────────────────────────────────────────
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Schedule Service connected to MongoDB'))
  .catch((err) => console.error('❌ Schedule Service DB Connection Error:', err.message));

// ── Schedule Schema ───────────────────────────────────────────────────────────
const scheduleSchema = new mongoose.Schema({
  doctorId: { type: String, required: true },
  doctorName: { type: String, required: true },
  dayOfWeek: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  slotDurationMinutes: { type: Number, default: 30 },
  maxPatientsPerSlot: { type: Number, default: 1 },
  isAvailable: { type: Boolean, default: true },
  organizationId: { type: String, default: null }
}, { timestamps: true });

const Schedule = mongoose.models.Schedule || mongoose.model('Schedule', scheduleSchema);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    service: 'Schedule Service',
    status: 'UP',
    port: PORT,
    database: mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED',
    timestamp: new Date().toISOString()
  });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/api/schedules', async (req, res) => {
  try {
    const { doctorId, dayOfWeek, organizationId } = req.query;
    const filter = {};
    if (doctorId) filter.doctorId = doctorId;
    if (dayOfWeek) filter.dayOfWeek = dayOfWeek;
    if (organizationId) filter.organizationId = organizationId;

    const schedules = await Schedule.find(filter);
    res.json({ success: true, count: schedules.length, data: schedules });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/schedules', async (req, res) => {
  try {
    const schedule = await Schedule.create(req.body);
    res.status(201).json({ success: true, data: schedule });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.put('/api/schedules/:id', async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: schedule });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Schedule Service running independently on port ${PORT}`);
  });
}

module.exports = app;
