const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User'); // Change to your main User model if you have one
// OR if subadmin is a separate model, import both admin and subadmin and adapt logic accordingly

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization && 
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by id from token payload (could be admin, subadmin, etc.)
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new ErrorResponse('No user found with this id', 404));
    }

    req.user = user; // Attach user object to req.user for controllers

    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(`User role '${req.user.role}' is not authorized`, 403)
      );
    }
    next();
  };
};
