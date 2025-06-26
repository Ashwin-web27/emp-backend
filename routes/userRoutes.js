const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

// Protect all routes with JWT and authorize only admin

// User routes
router.route('/')
  .get(getUsers)  // Protected route
  .post(createUser);// public route

  
router.route('/:id')
  .get(getUser)           // GET /api/v1/users/:id - Get single user
  .put(updateUser)        // PUT /api/v1/users/:id - Update user
  .delete(deleteUser);    // DELETE /api/v1/users/:id - Delete user

module.exports = router;