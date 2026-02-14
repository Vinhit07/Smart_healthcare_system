const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const {
    predictDiseaseValidation,
    chatValidation,
    analyzeValidation,
} = require('../utils/validation');
const { aiLimiter } = require('../middleware/rateLimitMiddleware');

// All routes require authentication and patient role
router.use(authMiddleware);
router.use(requireRole('PATIENT'));

// AI routes with specific rate limiting
router.post('/predict-disease', aiLimiter, predictDiseaseValidation, aiController.predictDiseaseController);
router.post('/chat', aiLimiter, chatValidation, aiController.chat);
router.post('/analyze', aiLimiter, analyzeValidation, aiController.analyze);

// History routes (no additional rate limiting)
router.get('/history', aiController.getHistory);
router.get('/chat/:sessionId', aiController.getChatSession);

module.exports = router;
