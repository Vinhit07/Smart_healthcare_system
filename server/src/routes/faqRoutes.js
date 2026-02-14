const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// Public route (technically, maybe verify if we want public without auth? User needs to be logged in for now roughly based on app structure, but let's allow public access to FAQs without token if needed. But for now app structure usually demands login. Let's make it public routes but mount them in a way that doesn't strictly need auth if we want. However, for simplicity and consistency with current app design where everything is behind auth usually, I'll keep it open or check requirements. The user said "faq, etc", usually public. Let's make GET public, others protected.)

// GET /api/faqs - Public
router.get('/', faqController.getAllFAQs);

// Protected Admin Routes
router.post('/', authMiddleware, requireRole('ADMIN'), faqController.createFAQ);
router.put('/:id', authMiddleware, requireRole('ADMIN'), faqController.updateFAQ);
router.delete('/:id', authMiddleware, requireRole('ADMIN'), faqController.deleteFAQ);

module.exports = router;
