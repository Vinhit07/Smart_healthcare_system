const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const { updateAvailabilityValidation } = require('../utils/validation');

// Public routes (no auth required)
router.get('/', doctorController.getAllDoctors);
router.get('/:id', doctorController.getDoctorById);

// Protected routes
router.put(
    '/availability',
    authMiddleware,
    requireRole('DOCTOR'),
    updateAvailabilityValidation,
    doctorController.updateAvailability
);

router.put(
    '/:id/verify',
    authMiddleware,
    requireRole('ADMIN'),
    doctorController.verifyDoctor
);

module.exports = router;
