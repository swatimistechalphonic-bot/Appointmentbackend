const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { sendSuccess, sendError } = require('../shared/utils/responseHelper');
const { HTTP_STATUS } = require('../shared/constants');

// ── Audit Log Schema ──────────────────────────────────────────────────────────
const auditSchema = new mongoose.Schema({
  action:         { type: String, required: true },
  entity:         { type: String, required: true },
  entityId:       { type: String, default: '' },
  performedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  performedByName:{ type: String, default: 'System' },
  performedByRole:{ type: String, default: 'system' },
  organization:   { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
  ipAddress:      { type: String, default: '' },
  userAgent:      { type: String, default: '' },
  before:         { type: mongoose.Schema.Types.Mixed, default: null },
  after:          { type: mongoose.Schema.Types.Mixed, default: null },
  status:         { type: String, enum: ['success', 'failed', 'warning'], default: 'success' },
  description:    { type: String, default: '' },
}, { timestamps: true });

auditSchema.index({ action: 1, entity: 1, createdAt: -1 });
auditSchema.index({ performedBy: 1, createdAt: -1 });

const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditSchema);

// GET /api/audit — List all audit logs with filters
router.get('/', async (req, res) => {
  try {
    const { action, entity, userId, organization, status, from, to, search, page = 1, limit = 50 } = req.query;
    let filter = {};
    if (action) filter.action = new RegExp(action, 'i');
    if (entity) filter.entity = entity;
    if (userId) filter.performedBy = userId;
    if (organization) filter.organization = organization;
    if (status) filter.status = status;
    if (search) filter.$or = [
      { description: new RegExp(search, 'i') },
      { performedByName: new RegExp(search, 'i') },
      { action: new RegExp(search, 'i') },
    ];
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [logs, total] = await Promise.all([
      AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      AuditLog.countDocuments(filter)
    ]);

    return sendSuccess(res, { logs, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) }, 'Audit logs fetched');
  } catch (err) {
    return sendError(res, err.message);
  }
});

// GET /api/audit/:id — Single log detail
router.get('/:id', async (req, res) => {
  try {
    const log = await AuditLog.findById(req.params.id);
    if (!log) return sendError(res, 'Audit log not found.', HTTP_STATUS.NOT_FOUND);
    return sendSuccess(res, log, 'Audit log fetched');
  } catch (err) {
    return sendError(res, err.message);
  }
});

// POST /api/audit — Write a new audit log entry
router.post('/', async (req, res) => {
  try {
    const { action, entity, entityId, performedBy, performedByName, performedByRole, organization, ipAddress, userAgent, before, after, status, description } = req.body;
    if (!action || !entity)
      return sendError(res, 'action and entity are required.', HTTP_STATUS.BAD_REQUEST);
    const log = await AuditLog.create({ action, entity, entityId, performedBy, performedByName, performedByRole, organization, ipAddress, userAgent, before, after, status, description });
    return sendSuccess(res, log, 'Audit log recorded', HTTP_STATUS.CREATED);
  } catch (err) {
    return sendError(res, err.message);
  }
});

// DELETE /api/audit — Purge logs older than X days (admin only)
router.delete('/purge', async (req, res) => {
  try {
    const { olderThanDays = 90 } = req.body;
    const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
    const result = await AuditLog.deleteMany({ createdAt: { $lt: cutoff } });
    return sendSuccess(res, { deletedCount: result.deletedCount }, `Purged logs older than ${olderThanDays} days`);
  } catch (err) {
    return sendError(res, err.message);
  }
});

module.exports = { serviceName: 'Audit & Compliance Service', basePath: '/api/audit', router };
