const express = require('express');
const {
  getEmployees,
  getEmployee,
  getEmployeesByReferral,
  getMyReferredEmployees,
  addEmployee,
   deleteEmployee, // <-- add this
} = require('../controllers/employeeController');

const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// Protect all routes below this
// router.use(protect);

// Route: GET current user's referred employees
router.get('/me/referred', getMyReferredEmployees);

// Route: GET employees by referral code
router.get('/referred/:referralCode', getEmployeesByReferral);

// Admin & Subadmin routes
// router.use(authorize('admin', 'subadmin'));

// Route: GET all employees
router.get('/', getEmployees);

// Route: POST add new employee
router.post('/', addEmployee);

// Route: GET single employee by ID
router.get('/:id', getEmployee);
router.delete("/:id",deleteEmployee);

module.exports = router;
