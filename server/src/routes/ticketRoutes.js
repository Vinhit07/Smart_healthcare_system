const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const { body } = require('express-validator');

// Validation rules
const ticketValidation = [
    body('subject').notEmpty().withMessage('Subject is required'),
    body('message').notEmpty().withMessage('Message is required'),
];

router.use(authMiddleware);

// Patient/Doctor routes
router.post('/', ticketValidation, ticketController.createTicket);
router.get('/my', ticketController.getMyTickets);

// Admin routes
router.get('/', requireRole('ADMIN'), ticketController.getAllTickets);
router.put('/:id', requireRole('ADMIN'), ticketController.updateTicket);

module.exports = router;
