const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const router = express.Router();
const { generateAccessToken, generateRefreshToken } = require('../shared/utils/tokenHelper');
const { sendSuccess, sendError } = require('../shared/utils/responseHelper');
const { ROLES, HTTP_STATUS } = require('../shared/constants');

// ── User Schema ───────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name:           { type: String, required: true, trim: true },
  email:          { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:       { type: String, required: true },
  role:           { type: String, enum: Object.values(ROLES), default: ROLES.PATIENT },
  phone:          { type: String, default: '' },
  avatar:         { type: String, default: '' },
  specialization: { type: String, default: '' },
  organization:   { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
  isActive:       { type: Boolean, default: true },
  isVerified:     { type: Boolean, default: false },
  refreshToken:   { type: String, default: null },
  lastLogin:      { type: Date, default: null },
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const bcrypt = require('bcrypt');
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidate) {
  const bcrypt = require('bcrypt');
  return bcrypt.compare(candidate, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

// ── Register ──────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = ROLES.PATIENT, phone, specialization } = req.body;
    if (!name || !email || !password)
      return sendError(res, 'Name, email, and password are required.', HTTP_STATUS.BAD_REQUEST);
    const existing = await User.findOne({ email });
    if (existing) return sendError(res, 'Account already exists with this email.', HTTP_STATUS.CONFLICT);

    const user = await User.create({ name, email, password, role, phone, specialization });
    const payload = { id: user._id, name: user.name, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    user.refreshToken = refreshToken;
    await user.save();

    return sendSuccess(res, { accessToken, refreshToken, user: payload }, 'Registration successful', HTTP_STATUS.CREATED);
  } catch (err) {
    return sendError(res, err.message);
  }
});

// ── Login ─────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return sendError(res, 'Email and password required.', HTTP_STATUS.BAD_REQUEST);
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return sendError(res, 'Invalid email or password.', HTTP_STATUS.UNAUTHORIZED);
    if (!user.isActive) return sendError(res, 'Account is deactivated.', HTTP_STATUS.FORBIDDEN);

    const payload = { id: user._id, name: user.name, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();
    return sendSuccess(res, { accessToken, refreshToken, user: payload }, 'Login successful');
  } catch (err) {
    return sendError(res, err.message);
  }
});

// ── Logout ────────────────────────────────────────────────────────────────────
router.post('/logout', async (req, res) => {
  try {
    const { userId } = req.body;
    if (userId) await User.findByIdAndUpdate(userId, { refreshToken: null });
    return sendSuccess(res, null, 'Logged out successfully');
  } catch (err) {
    return sendError(res, err.message);
  }
});

// ── Get All Users ─────────────────────────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).select('-password -refreshToken').sort({ createdAt: -1 });
    return sendSuccess(res, { users }, 'Users fetched');
  } catch (err) {
    return sendError(res, err.message);
  }
});

// ── Get All Doctors ───────────────────────────────────────────────────────────
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await User.find({ role: ROLES.DOCTOR, isActive: true })
      .select('-password -refreshToken').sort({ name: 1 });
    return sendSuccess(res, { doctors }, 'Doctors fetched');
  } catch (err) {
    return sendError(res, err.message);
  }
});

// ── Get Profile ───────────────────────────────────────────────────────────────
router.get('/me', async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return sendError(res, 'User ID required.', HTTP_STATUS.BAD_REQUEST);
    const user = await User.findById(id).select('-password -refreshToken');
    if (!user) return sendError(res, 'User not found.', HTTP_STATUS.NOT_FOUND);
    return sendSuccess(res, user, 'Profile fetched');
  } catch (err) {
    return sendError(res, err.message);
  }
});

module.exports = { serviceName: 'Auth & Identity Service', basePath: '/api/auth', router };
