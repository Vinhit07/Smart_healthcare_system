const { body, param, query } = require('express-validator');

// Auth validation
const registerValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('role')
        .optional()
        .isIn(['PATIENT', 'DOCTOR', 'ADMIN'])
        .withMessage('Invalid role'),
    body('specialization')
        .if(body('role').equals('DOCTOR'))
        .notEmpty()
        .withMessage('Specialization required for doctors'),
];

const loginValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
];

// Appointment validation
const createAppointmentValidation = [
    body('doctorId').isUUID().withMessage('Valid doctor ID required'),
    body('date').isISO8601().toDate().withMessage('Valid date required'),
    body('timeSlot').trim().notEmpty().withMessage('Time slot required'),
    body('reason').trim().notEmpty().withMessage('Reason required'),
];

const updateAppointmentStatusValidation = [
    param('id').isUUID().withMessage('Valid appointment ID required'),
    body('status')
        .isIn(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'])
        .withMessage('Invalid status'),
];

// Prescription validation
const createPrescriptionValidation = [
    body('patientId').isUUID().withMessage('Valid patient ID required'),
    body('appointmentId').optional().isUUID().withMessage('Valid appointment ID required'),
    body('medicationName').trim().notEmpty().withMessage('Medication name required'),
    body('dosage').trim().notEmpty().withMessage('Dosage required'),
    body('frequency').trim().notEmpty().withMessage('Frequency required'),
    body('startDate').isISO8601().toDate().withMessage('Valid start date required'),
    body('endDate').isISO8601().toDate().withMessage('Valid end date required'),
];

// AI validation
const predictDiseaseValidation = [
    body('symptoms')
        .isArray({ min: 1 })
        .withMessage('At least one symptom required'),
    body('symptoms.*').trim().notEmpty().withMessage('Symptoms cannot be empty'),
];

const chatValidation = [
    body('message').trim().notEmpty().withMessage('Message required'),
    body('sessionId').optional().isUUID().withMessage('Valid session ID required'),
];

const analyzeValidation = [
    body('text').trim().notEmpty().withMessage('Symptom text required'),
];

// Doctor validation
const updateAvailabilityValidation = [
    body('availableSlots').isArray().withMessage('Available slots must be an array'),
];

module.exports = {
    registerValidation,
    loginValidation,
    createAppointmentValidation,
    updateAppointmentStatusValidation,
    createPrescriptionValidation,
    predictDiseaseValidation,
    chatValidation,
    analyzeValidation,
    updateAvailabilityValidation,
};
