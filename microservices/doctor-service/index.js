require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5003;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/appointment_doctor_db';

app.use(cors());
app.use(express.json());

// ── Connect DB ───────────────────────────────────────────────────────────────
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Doctor Service connected to MongoDB'))
  .catch((err) => console.error('❌ Doctor Service DB Connection Error:', err.message));

// ── Doctor Schema ─────────────────────────────────────────────────────────────
const doctorSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  specialization: { type: String, required: true },
  experienceYears: { type: Number, default: 0 },
  consultationFee: { type: Number, default: 500 },
  department: { type: String, default: 'General' },
  availableDays: [{ type: String }],
  isAvailable: { type: Boolean, default: true },
  organizationId: { type: String, default: null }
}, { timestamps: true });

const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    service: 'Doctor Service',
    status: 'UP',
    port: PORT,
    database: mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED',
    timestamp: new Date().toISOString()
  });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/api/doctors', async (req, res) => {
  try {
    const { specialization, isAvailable, organizationId } = req.query;
    const filter = {};
    if (specialization) filter.specialization = specialization;
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';
    if (organizationId) filter.organizationId = organizationId;

    const doctors = await Doctor.find(filter).sort({ name: 1 });
    res.json({ success: true, count: doctors.length, data: doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/doctors/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, data: doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/doctors', async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body);
    res.status(201).json({ success: true, data: doctor });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.put('/api/doctors/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: doctor });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Doctor Service running independently on port ${PORT}`);
  });
}

module.exports = app;
