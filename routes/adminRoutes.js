const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { loginAdmin, getCurrentAdmin } = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');

// @route   POST api/admin/login
// @desc    Authenticate admin & get token
// @access  Public
router.post('/login', loginAdmin);

// @route   GET api/admin/current
// @desc    Get current logged-in admin
// @access  Private
router.get('/current', getCurrentAdmin);

module.exports = router;