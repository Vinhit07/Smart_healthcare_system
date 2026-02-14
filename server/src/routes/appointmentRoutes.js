const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const {
    createAppointmentValidation,
    updateAppointmentStatusValidation,
} = require('../utils/validation');

// All routes require authentication
router.use(authMiddleware);

// Patient routes
router.post('/', requireRole('PATIENT'), createAppointmentValidation, appointmentController.createAppointment);

// Patient & Doctor routes
router.get('/my', requireRole('PATIENT', 'DOCTOR'), appointmentController.getMyAppointments);
router.put('/:id/status', requireRole('PATIENT', 'DOCTOR', 'ADMIN'), updateAppointmentStatusValidation, appointmentController.updateAppointmentStatus);

// Admin routes
router.get('/', requireRole('ADMIN'), appointmentController.getAllAppointments);

module.exports = router;
