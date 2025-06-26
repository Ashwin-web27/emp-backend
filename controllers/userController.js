const User = require('../models/User');
const Employee = require('../models/Employee');

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    // Populate referral information
    const users = await User.find()
      .select('-password')
      .populate({
        path: 'referral',
        select: 'firstName lastName email'
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private/Admin
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate({
        path: 'referral',
        select: 'firstName lastName email'
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Create user
// @route   POST /api/v1/users
// @access  Private/Admin
// controllers/userController.js
exports.createUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phoneNumber, age, city, password, referral } = req.body;

    // Basic validation (excluding referral from required check)
    if (!firstName || !lastName || !email || !phoneNumber || !age || !city || !password) {
      return res.status(400).json({
        success: false,
        message: 'Required fields missing'
      });
    }

    // Check referral if provided
    if (referral) {
      const employee = await Employee.findById(referral);
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Referral employee not found'
        });
      }
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      age,
      city,
      password,
      referral: referral || null
    });

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};
// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    // Exclude password and referral from update
    const { password, referral, ...updateData } = req.body;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    }).select('-password')
      .populate({
        path: 'referral',
        select: 'firstName lastName email'
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};