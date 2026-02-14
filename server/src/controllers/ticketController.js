const prisma = require('../services/prismaClient');
const { validationResult } = require('express-validator');

/**
 * Create a new support ticket
 * POST /api/tickets
 */
const createTicket = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { subject, message } = req.body;
        const userId = req.user.userId;

        const ticket = await prisma.supportTicket.create({
            data: {
                userId,
                subject,
                message,
                status: 'OPEN',
            },
        });

        res.status(201).json({ message: 'Ticket created successfully', ticket });
    } catch (error) {
        console.error('Create ticket error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Get my tickets
 * GET /api/tickets/my
 */
const getMyTickets = async (req, res) => {
    try {
        const userId = req.user.userId;

        const tickets = await prisma.supportTicket.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        res.json({ tickets });
    } catch (error) {
        console.error('Get my tickets error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Get all tickets (Admin only)
 * GET /api/tickets
 */
const getAllTickets = async (req, res) => {
    try {
        const tickets = await prisma.supportTicket.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json({ tickets });
    } catch (error) {
        console.error('Get all tickets error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Update ticket status and response (Admin only)
 * PUT /api/tickets/:id
 */
const updateTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, response } = req.body;

        const ticket = await prisma.supportTicket.update({
            where: { id },
            data: {
                status,
                response,
            },
        });

        res.json({ message: 'Ticket updated', ticket });
    } catch (error) {
        console.error('Update ticket error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    createTicket,
    getMyTickets,
    getAllTickets,
    updateTicket,
};
