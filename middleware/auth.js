const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'appointment_app_secret_key_123';

/**
 * Protect middleware to verify JWT token in Authorization header
 */
const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, JWT_SECRET);

            // Get user from token payload and attach to req.user (excluding password)
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'User associated with token no longer exists'
                });
            }

            next();
        } catch (error) {
            console.error('JWT Auth Error:', error.message);
            return res.status(401).json({
                success: false,
                message: 'Not authorized, token failed or expired'
            });
        }
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, no token provided'
        });
    }
};

/**
 * Optional Role-based authorization middleware
 */
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Role '${req.user ? req.user.role : 'none'}' is not authorized to access this resource`
            });
        }
        next();
    };
};

module.exports = { protect, authorizeRoles };
