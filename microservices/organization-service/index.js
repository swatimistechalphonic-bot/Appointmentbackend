const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { sendSuccess, sendError } = require('../shared/utils/responseHelper');
const { HTTP_STATUS } = require('../shared/constants');

// ── Organization Schema ───────────────────────────────────────────────────────
const organizationSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  slug:          { type: String, required: true, unique: true, lowercase: true },
  type:          { type: String, enum: ['clinic', 'hospital', 'diagnostic_center', 'polyclinic'], default: 'clinic' },
  address:       { type: String, default: '' },
  city:          { type: String, default: '' },
  state:         { type: String, default: '' },
  country:       { type: String, default: 'India' },
  phone:         { type: String, default: '' },
  email:         { type: String, default: '' },
  logo:          { type: String, default: '' },
  subscriptionPlan: { type: String, enum: ['free', 'starter', 'professional', 'enterprise'], default: 'free' },
  subscriptionExpiry: { type: Date, default: null },
  isActive:      { type: Boolean, default: true },
  adminUser:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  settings: {
    timezone:    { type: String, default: 'Asia/Kolkata' },
    currency:    { type: String, default: 'INR' },
    workingHours:{ type: String, default: '09:00-18:00' },
    workingDays: { type: [String], default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
  }
}, { timestamps: true });

const Organization = mongoose.models.Organization || mongoose.model('Organization', organizationSchema);

// ── GET All Organizations (Super Admin only) ──────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const orgs = await Organization.find().sort({ createdAt: -1 });
    return sendSuccess(res, { organizations: orgs }, 'Organizations fetched');
  } catch (err) {
    return sendError(res, err.message);
  }
});

// ── GET Organization by ID or Slug ────────────────────────────────────────────
router.get('/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const org = mongoose.Types.ObjectId.isValid(idOrSlug)
      ? await Organization.findById(idOrSlug)
      : await Organization.findOne({ slug: idOrSlug });
    if (!org) return sendError(res, 'Organization not found.', HTTP_STATUS.NOT_FOUND);
    return sendSuccess(res, org, 'Organization fetched');
  } catch (err) {
    return sendError(res, err.message);
  }
});

// ── POST Create Organization ──────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { name, type, address, city, state, country, phone, email, adminUser } = req.body;
    if (!name) return sendError(res, 'Organization name is required.', HTTP_STATUS.BAD_REQUEST);
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();
    const org = await Organization.create({ name, slug, type, address, city, state, country, phone, email, adminUser });
    return sendSuccess(res, org, 'Organization created successfully', HTTP_STATUS.CREATED);
  } catch (err) {
    return sendError(res, err.message);
  }
});

// ── PUT Update Organization ───────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const org = await Organization.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!org) return sendError(res, 'Organization not found.', HTTP_STATUS.NOT_FOUND);
    return sendSuccess(res, org, 'Organization updated');
  } catch (err) {
    return sendError(res, err.message);
  }
});

// ── DELETE Organization ───────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const org = await Organization.findByIdAndDelete(req.params.id);
    if (!org) return sendError(res, 'Organization not found.', HTTP_STATUS.NOT_FOUND);
    return sendSuccess(res, null, 'Organization deleted');
  } catch (err) {
    return sendError(res, err.message);
  }
});

module.exports = { serviceName: 'Organization & Tenant Service', basePath: '/api/organizations', router };
