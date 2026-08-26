const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { sendSuccess, sendError } = require('../../shared/utils/responseHelper');
const { HTTP_STATUS } = require('../../shared/constants');

// ── Analytics Schema ──────────────────────────────────────────────────────────
const analyticsSchema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
  date:         { type: String, required: true },
  metrics: {
    newPatients:         { type: Number, default: 0 },
    totalAppointments:   { type: Number, default: 0 },
    completedAppts:      { type: Number, default: 0 },
    cancelledAppts:      { type: Number, default: 0 },
    revenue:             { type: Number, default: 0 },
    prescriptionsIssued: { type: Number, default: 0 },
    queueTokens:         { type: Number, default: 0 },
    avgWaitTime:         { type: Number, default: 0 }, // minutes
    activeDoctors:       { type: Number, default: 0 },
  }
}, { timestamps: true });

const Analytics = mongoose.models.Analytics || mongoose.model('Analytics', analyticsSchema);

// GET /api/analytics/overview — Real-time overview stats computed from all models
router.get('/overview', async (req, res) => {
  try {
    // Aggregate from multiple collections dynamically
    const Appointment = mongoose.models.Appointment;
    const Prescription = mongoose.models.Prescription;
    const Queue = mongoose.models.Queue;
    const User = mongoose.models.User;

    const today = new Date().toISOString().split('T')[0];
    const [
      totalAppointments, todayAppointments, completedAppointments, pendingAppointments,
      totalPrescriptions, todayPrescriptions, totalQueueTokens, todayQueueTokens, totalDoctors, totalPatients
    ] = await Promise.all([
      Appointment ? Appointment.countDocuments() : Promise.resolve(0),
      Appointment ? Appointment.countDocuments({ date: today }) : Promise.resolve(0),
      Appointment ? Appointment.countDocuments({ status: 'completed' }) : Promise.resolve(0),
      Appointment ? Appointment.countDocuments({ status: 'pending' }) : Promise.resolve(0),
      Prescription ? Prescription.countDocuments() : Promise.resolve(0),
      Prescription ? Prescription.countDocuments({ date: today }) : Promise.resolve(0),
      Queue ? Queue.countDocuments() : Promise.resolve(0),
      Queue ? Queue.countDocuments({ date: today }) : Promise.resolve(0),
      User ? User.countDocuments({ role: 'doctor' }) : Promise.resolve(0),
      User ? User.countDocuments({ role: 'patient' }) : Promise.resolve(0),
    ]);

    return sendSuccess(res, {
      overview: {
        totalAppointments, todayAppointments, completedAppointments, pendingAppointments,
        totalPrescriptions, todayPrescriptions, totalQueueTokens, todayQueueTokens, totalDoctors, totalPatients,
        date: today
      }
    }, 'Analytics overview fetched');
  } catch (err) {
    return sendError(res, err.message);
  }
});

// GET /api/analytics/revenue — Revenue trend over time
router.get('/revenue', async (req, res) => {
  try {
    const Billing = mongoose.models.Billing;
    if (!Billing) return sendSuccess(res, { revenue: [] }, 'Billing model not yet available');

    const revenue = await Billing.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: { $substr: ['$createdAt', 0, 7] }, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $limit: 12 }
    ]);

    return sendSuccess(res, { revenue }, 'Revenue trends fetched');
  } catch (err) {
    return sendError(res, err.message);
  }
});

// GET /api/analytics/appointments — Appointment trends
router.get('/appointments', async (req, res) => {
  try {
    const Appointment = mongoose.models.Appointment;
    if (!Appointment) return sendSuccess(res, { trends: [] }, 'No data yet');

    const trends = await Appointment.aggregate([
      { $group: { _id: '$date', total: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }, cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } } } },
      { $sort: { _id: -1 } },
      { $limit: 30 }
    ]);

    return sendSuccess(res, { trends }, 'Appointment trends fetched');
  } catch (err) {
    return sendError(res, err.message);
  }
});

module.exports = { serviceName: 'Analytics & Telemetry Service', basePath: '/api/analytics', router };
