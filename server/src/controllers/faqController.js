const prisma = require('../services/prismaClient');

/**
 * Get all FAQs
 * GET /api/faqs
 */
const getAllFAQs = async (req, res) => {
    try {
        const faqs = await prisma.fAQ.findMany({
            orderBy: { createdAt: 'desc' },
        });

        res.json({ faqs });
    } catch (error) {
        console.error('Get FAQs error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Create FAQ (Admin only)
 * POST /api/faqs
 */
const createFAQ = async (req, res) => {
    try {
        const { question, answer, category } = req.body;

        const faq = await prisma.fAQ.create({
            data: {
                question,
                answer,
                category,
            },
        });

        res.status(201).json({ message: 'FAQ created', faq });
    } catch (error) {
        console.error('Create FAQ error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Update FAQ (Admin only)
 * PUT /api/faqs/:id
 */
const updateFAQ = async (req, res) => {
    try {
        const { id } = req.params;
        const { question, answer, category } = req.body;

        const faq = await prisma.fAQ.update({
            where: { id },
            data: {
                question,
                answer,
                category,
            },
        });

        res.json({ message: 'FAQ updated', faq });
    } catch (error) {
        console.error('Update FAQ error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Delete FAQ (Admin only)
 * DELETE /api/faqs/:id
 */
const deleteFAQ = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.fAQ.delete({
            where: { id },
        });

        res.json({ message: 'FAQ deleted' });
    } catch (error) {
        console.error('Delete FAQ error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getAllFAQs,
    createFAQ,
    updateFAQ,
    deleteFAQ,
};
