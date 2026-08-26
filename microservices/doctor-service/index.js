const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { sendSuccess, sendError } = require('../../shared/utils/responseHelper');
const { HTTP_STATUS } = require('../../shared/constants');

// ── Doctor Profile Schema ─────────────────────────────────────────────────────
const doctorSchema = new mongoose.Schema({
  user:             { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  organization:     { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
  name:             { type: String, required: true },
  email:            { type: String, default: '' },
  phone:            { type: String, default: '' },
  specialization:   { type: String, default: 'General Physician' },
  qualification:    { type: String, default: 'MBBS' },
  experience:       { type: Number, default: 0 }, // years
  registrationNo:   { type: String, default: '' },
  bio:              { type: String, default: '' },
  avatar:           { type: String, default: '' },
  consultationFee:  { type: Number, default: 500 },
  department:       { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
  availableDays:    { type: [String], default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  slotDuration:     { type: Number, default: 15 }, // minutes per appointment slot
  rating:           { type: Number, default: 0 },
  totalReviews:     { type: Number, default: 0 },
  isAvailable:      { type: Boolean, default: true },
}, { timestamps: true });

const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema);

router.get('/', async (req, res) => {
  try {
    const { search, specialization, organization } = req.query;
    let filter = {};
    if (search) filter.$or = [{ name: new RegExp(search, 'i') }, { specialization: new RegExp(search, 'i') }];
    if (specialization) filter.specialization = new RegExp(specialization, 'i');
    if (organization) filter.organization = organization;
    const doctors = await Doctor.find(filter).populate('department', 'name').sort({ name: 1 });
    return sendSuccess(res, { doctors, count: doctors.length }, 'Doctors fetched');
  } catch (err) {
    return sendError(res, err.message);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('department', 'name');
    if (!doctor) return sendError(res, 'Doctor not found.', HTTP_STATUS.NOT_FOUND);
    return sendSuccess(res, doctor, 'Doctor profile fetched');
  } catch (err) {
    return sendError(res, err.message);
  }
});

router.post('/', async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body);
    return sendSuccess(res, doctor, 'Doctor profile created', HTTP_STATUS.CREATED);
  } catch (err) {
    return sendError(res, err.message);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doctor) return sendError(res, 'Doctor not found.', HTTP_STATUS.NOT_FOUND);
    return sendSuccess(res, doctor, 'Doctor updated');
  } catch (err) {
    return sendError(res, err.message);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) return sendError(res, 'Doctor not found.', HTTP_STATUS.NOT_FOUND);
    return sendSuccess(res, null, 'Doctor deleted');
  } catch (err) {
    return sendError(res, err.message);
  }
});

module.exports = { serviceName: 'Doctor Profile Service', basePath: '/api/doctors', router };
