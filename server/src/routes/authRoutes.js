const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { registerValidation, loginValidation } = require('../utils/validation');
const { authLimiter } = require('../middleware/rateLimitMiddleware');

// Public routes (with rate limiting)
router.post('/register', authLimiter, registerValidation, authController.register);
router.post('/login', authLimiter, loginValidation, authController.login);

// Protected routes
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
