// Load .env relative to THIS file so it works both standalone and when required
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/appointment_auth_db';
const JWT_SECRET = process.env.JWT_SECRET || 'appointment_app_secret_key_123';

app.use(cors());
app.use(express.json());

// ── Connect DB ───────────────────────────────────────────────────────────────
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Auth Service connected to MongoDB'))
  .catch((err) => console.error('❌ Auth Service DB Connection Error:', err.message));

// ── User Schema ───────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name:           { type: String, required: true, trim: true },
  email:          { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:       { type: String, required: true },
  role:           { type: String, enum: ['user', 'doctor', 'admin', 'super_admin', 'receptionist', 'patient'], default: 'user' },
  phone:          { type: String, default: '' },
  avatar:         { type: String, default: '' },
  specialization: { type: String, default: '' },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
  isActive:       { type: Boolean, default: true },
  refreshToken:   { type: String, default: null },
  lastLogin:      { type: Date, default: null }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    service: 'Auth Service',
    status: 'UP',
    port: PORT,
    database: mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED',
    timestamp: new Date().toISOString()
  });
});

// ── Register Route ────────────────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role = 'user', phone, specialization, organizationId } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Account already exists with this email.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      specialization,
      organizationId: organizationId || null
    });

    const payload = { id: user._id, name: user.name, email: user.email, role: user.role, organizationId: user.organizationId };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: payload
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ── Login Route ───────────────────────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated.' });
    }

    const payload = { id: user._id, name: user.name, email: user.email, role: user.role, organizationId: user.organizationId };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    user.lastLogin = new Date();
    await user.save();

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: payload
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ── Token Verification Endpoint ───────────────────────────────────────────────
app.post('/api/auth/verify-token', (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, valid: false, message: 'Token required' });
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({ success: true, valid: true, user: decoded });
  } catch (err) {
    return res.status(401).json({ success: false, valid: false, message: 'Invalid token' });
  }
});

// ── Logout ────────────────────────────────────────────────────────────────────
app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// Only start HTTP server when run directly (not when required by monolith gateway)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Auth Service running independently on port ${PORT}`);
  });
}

module.exports = app;
