const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { sendSuccess, sendError } = require('../shared/utils/responseHelper');
const { HTTP_STATUS } = require('../shared/constants');

// ── Medical Record Schema ─────────────────────────────────────────────────────
const medicalRecordSchema = new mongoose.Schema({
  patient:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientName:    { type: String, required: true },
  organization:   { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
  appointment:    { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null },
  doctor:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  doctorName:     { type: String, default: 'Dr. Specialist' },
  specialty:      { type: String, default: 'General Physician' },
  visitDate:      { type: String, required: true },
  chiefComplaint: { type: String, default: '' },
  diagnosis:      { type: String, required: true },
  vitals: {
    bloodPressure: { type: String, default: '—' },
    temperature:   { type: String, default: '—' },
    heartRate:     { type: String, default: '—' },
    weight:        { type: String, default: '—' },
    height:        { type: String, default: '—' },
    spo2:          { type: String, default: '—' },
  },
  clinicalNotes:  { type: String, default: '' },
  labTests:       { type: [String], default: [] },
  labResults:     { type: [{ testName: String, result: String, normalRange: String, date: String }], default: [] },
  prescription:   { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription', default: null },
  followUpDate:   { type: String, default: '' },
  recordType:     { type: String, enum: ['outpatient', 'inpatient', 'emergency', 'telemedicine', 'followup'], default: 'outpatient' },
}, { timestamps: true });

medicalRecordSchema.index({ patient: 1, visitDate: -1 });

const MedicalRecord = mongoose.models.MedicalRecord || mongoose.model('MedicalRecord', medicalRecordSchema);

// GET /api/records/patient/:patientId
router.get('/patient/:patientId', async (req, res) => {
  try {
    const records = await MedicalRecord.find({ patient: req.params.patientId })
      .populate('prescription', 'prescriptionId medicines')
      .sort({ visitDate: -1 });
    return sendSuccess(res, { records, count: records.length }, 'Medical records fetched');
  } catch (err) {
    return sendError(res, err.message);
  }
});

// GET /api/records/:id
router.get('/:id', async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id).populate('prescription');
    if (!record) return sendError(res, 'Record not found.', HTTP_STATUS.NOT_FOUND);
    return sendSuccess(res, record, 'Medical record fetched');
  } catch (err) {
    return sendError(res, err.message);
  }
});

// GET /api/records
router.get('/', async (req, res) => {
  try {
    const { patientId, doctorId, date, search } = req.query;
    let filter = {};
    if (patientId) filter.patient = patientId;
    if (doctorId) filter.doctor = doctorId;
    if (date) filter.visitDate = date;
    if (search) filter.$or = [
      { patientName: new RegExp(search, 'i') },
      { diagnosis: new RegExp(search, 'i') }
    ];
    const records = await MedicalRecord.find(filter).sort({ visitDate: -1 });
    return sendSuccess(res, { records, count: records.length }, 'Records fetched');
  } catch (err) {
    return sendError(res, err.message);
  }
});

// POST /api/records
router.post('/', async (req, res) => {
  try {
    const { patient, patientName, diagnosis, visitDate } = req.body;
    if (!patient || !patientName || !diagnosis || !visitDate)
      return sendError(res, 'patient, patientName, diagnosis, visitDate required.', HTTP_STATUS.BAD_REQUEST);
    const record = await MedicalRecord.create(req.body);
    return sendSuccess(res, record, 'Medical record created', HTTP_STATUS.CREATED);
  } catch (err) {
    return sendError(res, err.message);
  }
});

// PUT /api/records/:id
router.put('/:id', async (req, res) => {
  try {
    const record = await MedicalRecord.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!record) return sendError(res, 'Record not found.', HTTP_STATUS.NOT_FOUND);
    return sendSuccess(res, record, 'Record updated');
  } catch (err) {
    return sendError(res, err.message);
  }
});

module.exports = { serviceName: 'Electronic Health Record (EHR) Service', basePath: '/api/records', router };
