const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');

/**
 * Middleware to protect routes - verifies JWT token
 */
exports.protect = async (req, res, next) => {
  let token;

  // Extract token from Authorization header
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if token belongs to a User
    let authenticatedUser = await User.findById(decoded.id).select('-password');

    // If not found, check Employee
    if (!authenticatedUser) {
      authenticatedUser = await Employee.findById(decoded.id).select('-password');
    }

    if (!authenticatedUser) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User/Employee not found.',
      });
    }

    req.user = authenticatedUser; // Attach to request
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token verification failed.',
    });
  }
};

/**
 * Middleware to validate referral ID (only during user creation)
 */
exports.verifyReferral = async (req, res, next) => {
  if (req.method === 'POST' && req.originalUrl.includes('/users')) {
    const { referral } = req.body;

    if (referral) {
      try {
        const referringEmployee = await Employee.findById(referral);

        if (!referringEmployee) {
          return res.status(404).json({
            success: false,
            message: 'Referral employee not found.',
          });
        }

        req.referringEmployee = referringEmployee;
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: 'Invalid referral ID format.',
        });
      }
    }
  }

  next();
};
