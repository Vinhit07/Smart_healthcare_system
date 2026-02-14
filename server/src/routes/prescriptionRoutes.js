const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const { createPrescriptionValidation } = require('../utils/validation');

// All routes require authentication
router.use(authMiddleware);

// Doctor routes
router.post('/', requireRole('DOCTOR'), createPrescriptionValidation, prescriptionController.createPrescription);
router.put('/:id', requireRole('DOCTOR'), prescriptionController.updatePrescription);
router.delete('/:id', requireRole('DOCTOR'), prescriptionController.deletePrescription);

// Patient routes
router.get('/my', requireRole('PATIENT'), prescriptionController.getMyPrescriptions);

module.exports = router;
