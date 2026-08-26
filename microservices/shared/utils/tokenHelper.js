const jwt = require('jsonwebtoken');

/**
 * Generate an access token (short-lived: 15 minutes)
 */
const generateAccessToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });

/**
 * Generate a refresh token (long-lived: 7 days)
 */
const generateRefreshToken = (payload) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, { expiresIn: '7d' });

/**
 * Verify a token. Returns decoded payload or throws.
 */
const verifyToken = (token, secret = process.env.JWT_SECRET) =>
  jwt.verify(token, secret);

/**
 * Generate a simple auto-incrementing formatted ID string.
 * e.g. prefix='RX', count=5  → 'RX-2026-005'
 */
const generateFormattedId = (prefix, count, year = new Date().getFullYear()) =>
  `${prefix}-${year}-${String(count + 1).padStart(3, '0')}`;

module.exports = { generateAccessToken, generateRefreshToken, verifyToken, generateFormattedId };
