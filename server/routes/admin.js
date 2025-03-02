const express = require('express');
const { body } = require('express-validator');
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/adminAuth');
const validate = require('../middleware/validate');

const router = express.Router();

// Semua route memerlukan authentication dan admin role
router.use(auth);
router.use(isAdmin);

// Get all users
router.get('/users', adminController.getAllUsers);

// Get user details
router.get('/users/:userId', adminController.getUserDetails);

// Update user
router.put(
  '/users/:userId',
  [
    body('name').optional().trim().notEmpty(),
    body('email').optional().isEmail(),
    body('role').optional().isIn(['user', 'admin']),
  ],
  validate,
  adminController.updateUser
);

// Delete user
router.delete('/users/:userId', adminController.deleteUser);

// Get dashboard statistics
router.get('/statistics', adminController.getStatistics);

module.exports = router;