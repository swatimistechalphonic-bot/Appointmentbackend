const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { sendSuccess, sendError } = require('../shared/utils/responseHelper');
const { HTTP_STATUS } = require('../shared/constants');

// ── Notification Schema ───────────────────────────────────────────────────────
const notificationSchema = new mongoose.Schema({
  recipient:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:         { type: String, required: true },
  title:        { type: String, required: true },
  message:      { type: String, required: true },
  data:         { type: mongoose.Schema.Types.Mixed, default: {} },
  channel:      { type: [String], default: ['in_app'] }, // 'in_app', 'email', 'sms', 'push'
  isRead:       { type: Boolean, default: false },
  readAt:       { type: Date, default: null },
  sentAt:       { type: Date, default: Date.now },
}, { timestamps: true });

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

// GET /api/notifications?userId=xxx
router.get('/', async (req, res) => {
  try {
    const { userId, unreadOnly } = req.query;
    if (!userId) return sendError(res, 'userId is required.', HTTP_STATUS.BAD_REQUEST);
    const filter = { recipient: userId };
    if (unreadOnly === 'true') filter.isRead = false;
    const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ recipient: userId, isRead: false });
    return sendSuccess(res, { notifications, unreadCount }, 'Notifications fetched');
  } catch (err) {
    return sendError(res, err.message);
  }
});

// POST /api/notifications — Send a notification
router.post('/', async (req, res) => {
  try {
    const { recipient, type, title, message, data, channel } = req.body;
    if (!recipient || !title || !message)
      return sendError(res, 'recipient, title, and message are required.', HTTP_STATUS.BAD_REQUEST);
    const notification = await Notification.create({ recipient, type, title, message, data, channel });
    // TODO: Hook into email/SMS providers here
    return sendSuccess(res, notification, 'Notification sent', HTTP_STATUS.CREATED);
  } catch (err) {
    return sendError(res, err.message);
  }
});

// PATCH /api/notifications/:id/read — Mark as read
router.patch('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id, { isRead: true, readAt: new Date() }, { new: true }
    );
    if (!notification) return sendError(res, 'Notification not found.', HTTP_STATUS.NOT_FOUND);
    return sendSuccess(res, notification, 'Marked as read');
  } catch (err) {
    return sendError(res, err.message);
  }
});

// PATCH /api/notifications/mark-all-read — Mark all read for user
router.patch('/mark-all-read', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return sendError(res, 'userId required.', HTTP_STATUS.BAD_REQUEST);
    await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true, readAt: new Date() });
    return sendSuccess(res, null, 'All notifications marked as read');
  } catch (err) {
    return sendError(res, err.message);
  }
});

// DELETE /api/notifications/:id
router.delete('/:id', async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    return sendSuccess(res, null, 'Notification deleted');
  } catch (err) {
    return sendError(res, err.message);
  }
});

module.exports = { serviceName: 'Notification Service', basePath: '/api/notifications', router };
