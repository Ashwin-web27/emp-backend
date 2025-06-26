const Subadmin = require('../models/Subadmin');
const jwt = require('jsonwebtoken');

// Register Subadmin
exports.registerSubadmin = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingSubadmin = await Subadmin.findOne({ email });
    if (existingSubadmin) {
      return res.status(400).json({ message: 'Subadmin already exists' });
    }

    const newSubadmin = new Subadmin({ name, email, password });
    await newSubadmin.save();

    res.status(201).json({ message: 'Subadmin registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Login Subadmin
exports.loginSubadmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const subadmin = await Subadmin.findOne({ email });
    if (!subadmin) {
      return res.status(404).json({ message: 'Subadmin not found' });
    }

    const isMatch = await subadmin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: subadmin._id, email: subadmin.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ token, message: 'Login successful',subadmin });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
exports.getAllSubadmins = async (req, res) => {
  try {
    const subadmins = await Subadmin.find().select('-password -__v');
    
    if (!subadmins || subadmins.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'No subadmins found' 
      });
    }

    res.status(200).json({
      success: true,
      count: subadmins.length,
      data: subadmins
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};
