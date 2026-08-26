const jwt = require('jsonwebtoken');
const { HTTP_STATUS, ROLES } = require('../constants');

/**
 * Verifies the Bearer JWT token on the request.
 * Attaches decoded user payload to req.user.
 */
const authGuard = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Access denied. No authentication token provided.'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.'
    });
  }
};

/**
 * Role-based access guard factory.
 * Usage: roleGuard(ROLES.ADMIN, ROLES.DOCTOR)
 */
const roleGuard = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Authentication required before role check.'
    });
  }
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: `Access denied. Requires one of roles: [${allowedRoles.join(', ')}].`
    });
  }
  next();
};

/**
 * Global async error handler middleware.
 * Wrap async route handlers with this to avoid unhandled rejections.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Express error handler middleware.
 * Mount LAST in express app after all routes.
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = err.message || 'An unexpected server error occurred.';

  console.error(`[${new Date().toISOString()}] ${statusCode} — ${req.method} ${req.originalUrl}: ${message}`);

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * 404 Not Found handler.
 * Mount before errorHandler.
 */
const notFoundHandler = (req, res) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
};

module.exports = { authGuard, roleGuard, asyncHandler, errorHandler, notFoundHandler };
