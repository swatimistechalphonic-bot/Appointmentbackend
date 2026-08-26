const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { sendSuccess, sendError } = require('../../shared/utils/responseHelper');
const { HTTP_STATUS } = require('../../shared/constants');

// ── Telemedicine Session Schema ────────────────────────────────────────────────
const telemedicineSchema = new mongoose.Schema({
  sessionId:      { type: String, required: true, unique: true },
  appointment:    { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null },
  patient:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientName:    { type: String, required: true },
  doctor:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorName:     { type: String, required: true },
  organization:   { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
  status:         { type: String, enum: ['scheduled', 'waiting', 'active', 'completed', 'missed', 'cancelled'], default: 'scheduled' },
  scheduledAt:    { type: String, required: true },  // YYYY-MM-DD HH:mm
  startedAt:      { type: Date, default: null },
  endedAt:        { type: Date, default: null },
  duration:       { type: Number, default: 0 }, // minutes
  roomUrl:        { type: String, default: '' }, // Video room URL (Daily.co / Jitsi etc.)
  meetingToken:   { type: String, default: '' },
  notes:          { type: String, default: '' },
  recordingUrl:   { type: String, default: '' },
  chiefComplaint: { type: String, default: '' },
}, { timestamps: true });

const Telemedicine = mongoose.models.Telemedicine || mongoose.model('Telemedicine', telemedicineSchema);

const generateSessionId = () => `TM-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

// GET /api/telemedicine
router.get('/', async (req, res) => {
  try {
    const { doctorId, patientId, status, date } = req.query;
    let filter = {};
    if (doctorId) filter.doctor = doctorId;
    if (patientId) filter.patient = patientId;
    if (status) filter.status = status;
    if (date) filter.scheduledAt = new RegExp(date);
    const sessions = await Telemedicine.find(filter).sort({ createdAt: -1 });
    return sendSuccess(res, { sessions, count: sessions.length }, 'Sessions fetched');
  } catch (err) {
    return sendError(res, err.message);
  }
});

// GET /api/telemedicine/:id
router.get('/:id', async (req, res) => {
  try {
    const session = await Telemedicine.findById(req.params.id);
    if (!session) return sendError(res, 'Session not found.', HTTP_STATUS.NOT_FOUND);
    return sendSuccess(res, session, 'Session fetched');
  } catch (err) {
    return sendError(res, err.message);
  }
});

// POST /api/telemedicine — Create session
router.post('/', async (req, res) => {
  try {
    const { patient, patientName, doctor, doctorName, scheduledAt, chiefComplaint, appointment } = req.body;
    if (!patient || !doctor || !scheduledAt)
      return sendError(res, 'patient, doctor, and scheduledAt are required.', HTTP_STATUS.BAD_REQUEST);

    const sessionId = generateSessionId();
    // In production: generate a real video room URL from Daily.co / Jitsi / Twilio
    const roomUrl = `https://meet.caresync.in/${sessionId}`;
    const session = await Telemedicine.create({ sessionId, patient, patientName, doctor, doctorName, scheduledAt, chiefComplaint, appointment, roomUrl });
    return sendSuccess(res, session, `Telemedicine session ${sessionId} created`, HTTP_STATUS.CREATED);
  } catch (err) {
    return sendError(res, err.message);
  }
});

// PATCH /api/telemedicine/:id/start
router.patch('/:id/start', async (req, res) => {
  try {
    const session = await Telemedicine.findByIdAndUpdate(req.params.id, { status: 'active', startedAt: new Date() }, { new: true });
    if (!session) return sendError(res, 'Session not found.', HTTP_STATUS.NOT_FOUND);
    return sendSuccess(res, session, 'Session started');
  } catch (err) {
    return sendError(res, err.message);
  }
});

// PATCH /api/telemedicine/:id/end
router.patch('/:id/end', async (req, res) => {
  try {
    const { notes } = req.body;
    const session = await Telemedicine.findById(req.params.id);
    if (!session) return sendError(res, 'Session not found.', HTTP_STATUS.NOT_FOUND);
    const endedAt = new Date();
    const duration = session.startedAt ? Math.round((endedAt - session.startedAt) / 60000) : 0;
    await session.updateOne({ status: 'completed', endedAt, duration, notes: notes || session.notes });
    return sendSuccess(res, { ...session.toObject(), status: 'completed', endedAt, duration }, 'Session completed');
  } catch (err) {
    return sendError(res, err.message);
  }
});

module.exports = { serviceName: 'Telemedicine & Video Consultation Service', basePath: '/api/telemedicine', router };
