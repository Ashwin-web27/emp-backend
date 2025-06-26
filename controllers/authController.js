const Employee = require('../models/Employee');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// @desc    Register employee
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { fullName, email, password, confirmPassword,referralCode } = req.body;
    
    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    // Create employee with default role
    const employee = await Employee.create({
      fullName,
      email,
      password,
      referralCode // Add role field
    });

    // Create token with role
    const token = jwt.sign(
      { 
        id: employee._id,
        role: employee.role 
      }, 
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRE,
      }
    );

    res.status(201).json({
      success: true,
      token,
      data: {
        id: employee._id,
        fullName: employee.fullName,
        email: employee.email,
        referralCode:referralCode,
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
      });
    }
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Login Employee
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password',
      });
    }

    // Check for Employee
    const employee = await Employee.findOne({ email }).select('+password');

    if (!employee) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if password matches
    const isMatch = await employee.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Create token with role
    const token = jwt.sign(
      { 
        id: employee._id,
        role: employee.role 
      }, 
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRE,
      }
    );

    res.status(200).json({
      success: true,
      token,
      data: {
        id: employee._id,
        fullName: employee.fullName,
        email: employee.email,
        role: employee.role
      },
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Get current logged in employee
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    // Use req.user.id instead of req.employee.id
    const employee = await Employee.findById(req.user.id);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: employee._id,
        fullName: employee.fullName,
        email: employee.email,
        role: employee.role
      },
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};