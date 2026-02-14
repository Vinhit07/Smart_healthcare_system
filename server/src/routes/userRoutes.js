const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// All routes require authentication
router.use(authMiddleware);

// User profile routes
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

// Admin routes
router.get('/all', requireRole('ADMIN'), userController.getAllUsers);
router.delete('/:id', requireRole('ADMIN'), userController.deleteUser);

module.exports = router;
