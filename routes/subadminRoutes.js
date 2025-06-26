const express = require('express');
const router = express.Router();
const {
  registerSubadmin,
  loginSubadmin,
  getAllSubadmins
} = require('../controllers/subadminController');

router.post('/register', registerSubadmin);
router.post('/login', loginSubadmin);
router.get('/', getAllSubadmins);

module.exports = router;
