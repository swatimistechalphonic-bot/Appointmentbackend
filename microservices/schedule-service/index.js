const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { sendSuccess, sendError } = require('../shared/utils/responseHelper');
const { HTTP_STATUS } = require('../shared/constants');

// ── Schedule (Doctor Availability) Schema ─────────────────────────────────────
const scheduleSchema = new mongoose.Schema({
  doctor:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorName:     { type: String, default: '' },
  organization:   { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
  dayOfWeek:      { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], required: true },
  startTime:      { type: String, required: true },  // e.g., '09:00'
  endTime:        { type: String, required: true },  // e.g., '17:00'
  slotDuration:   { type: Number, default: 15 },     // minutes
  maxPatients:    { type: Number, default: 20 },
  isActive:       { type: Boolean, default: true },
  breakStart:     { type: String, default: '13:00' },
  breakEnd:       { type: String, default: '14:00' },
  consultationType: { type: [String], default: ['in-person'] }, // 'in-person', 'telemedicine'
}, { timestamps: true });

scheduleSchema.index({ doctor: 1, dayOfWeek: 1 });

const Schedule = mongoose.models.Schedule || mongoose.model('Schedule', scheduleSchema);

// ── Time Slots Generator ──────────────────────────────────────────────────────
const generateTimeSlots = (startTime, endTime, duration, breakStart, breakEnd) => {
  const slots = [];
  const toMinutes = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const toTime = (mins) => `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

  let current = toMinutes(startTime);
  const end = toMinutes(endTime);
  const bStart = toMinutes(breakStart || '13:00');
  const bEnd = toMinutes(breakEnd || '14:00');

  while (current + duration <= end) {
    if (current >= bStart && current < bEnd) { current = bEnd; continue; }
    slots.push({ time: toTime(current), label: toTime(current) + ' – ' + toTime(current + duration) });
    current += duration;
  }
  return slots;
};

// GET /api/schedules — All schedules
router.get('/', async (req, res) => {
  try {
    const { doctorId, day } = req.query;
    let filter = {};
    if (doctorId) filter.doctor = doctorId;
    if (day) filter.dayOfWeek = day;
    const schedules = await Schedule.find(filter).sort({ dayOfWeek: 1, startTime: 1 });
    return sendSuccess(res, { schedules, count: schedules.length }, 'Schedules fetched');
  } catch (err) {
    return sendError(res, err.message);
  }
});

// GET /api/schedules/slots?doctorId=xxx&day=Monday — Get available time slots
router.get('/slots', async (req, res) => {
  try {
    const { doctorId, day } = req.query;
    if (!doctorId || !day) return sendError(res, 'doctorId and day required.', HTTP_STATUS.BAD_REQUEST);
    const schedule = await Schedule.findOne({ doctor: doctorId, dayOfWeek: day, isActive: true });
    if (!schedule) return sendSuccess(res, { slots: [] }, 'No schedule configured for this day');
    const slots = generateTimeSlots(schedule.startTime, schedule.endTime, schedule.slotDuration, schedule.breakStart, schedule.breakEnd);
    return sendSuccess(res, { slots, schedule }, 'Time slots generated');
  } catch (err) {
    return sendError(res, err.message);
  }
});

// POST /api/schedules — Create schedule
router.post('/', async (req, res) => {
  try {
    const schedule = await Schedule.create(req.body);
    return sendSuccess(res, schedule, 'Schedule created', HTTP_STATUS.CREATED);
  } catch (err) {
    return sendError(res, err.message);
  }
});

// PUT /api/schedules/:id
router.put('/:id', async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!schedule) return sendError(res, 'Schedule not found.', HTTP_STATUS.NOT_FOUND);
    return sendSuccess(res, schedule, 'Schedule updated');
  } catch (err) {
    return sendError(res, err.message);
  }
});

// DELETE /api/schedules/:id
router.delete('/:id', async (req, res) => {
  try {
    await Schedule.findByIdAndDelete(req.params.id);
    return sendSuccess(res, null, 'Schedule deleted');
  } catch (err) {
    return sendError(res, err.message);
  }
});

module.exports = { serviceName: 'Doctor Schedule & Slots Service', basePath: '/api/schedules', router };
