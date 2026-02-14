const express = require('express');
const router = express.Router();
const { createReview, getDoctorReviews } = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Create review (Patient only)
router.post('/', authMiddleware, roleMiddleware(['PATIENT']), createReview);

// Get doctor reviews (Public)  
router.get('/doctor/:doctorId', getDoctorReviews);

module.exports = router;
