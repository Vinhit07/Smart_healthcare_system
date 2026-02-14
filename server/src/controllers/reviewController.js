const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a review for a completed appointment
const createReview = async (req, res) => {
    try {
        const patientId = req.user.id;
        const { appointmentId, rating, comment } = req.body;

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        // Check if appointment exists and is completed
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: { review: true }
        });

        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        if (appointment.patientId !== patientId) {
            return res.status(403).json({ error: 'You can only review your own appointments' });
        }

        if (appointment.status !== 'COMPLETED') {
            return res.status(400).json({ error: 'You can only review completed appointments' });
        }

        if (appointment.review) {
            return res.status(400).json({ error: 'This appointment has already been reviewed' });
        }

        // Create review
        const review = await prisma.review.create({
            data: {
                appointmentId,
                patientId,
                doctorId: appointment.doctorId,
                rating,
                comment
            }
        });

        // Update doctor's average rating
        await updateDoctorRating(appointment.doctorId);

        res.status(201).json({ review, message: 'Review submitted successfully' });
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({ error: 'Failed to create review' });
    }
};

// Get reviews for a specific doctor
const getDoctorReviews = async (req, res) => {
    try {
        const { doctorId } = req.params;

        const reviews = await prisma.review.findMany({
            where: { doctorId },
            include: {
                patient: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const doctor = await prisma.doctorProfile.findUnique({
            where: { userId: doctorId },
            select: { rating: true }
        });

        res.json({
            reviews,
            averageRating: doctor?.rating || 0,
            totalReviews: reviews.length
        });
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
};

// Helper function to update doctor's average rating
const updateDoctorRating = async (doctorId) => {
    const reviews = await prisma.review.findMany({
        where: { doctorId },
        select: { rating: true }
    });

    if (reviews.length === 0) return;

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await prisma.doctorProfile.update({
        where: { userId: doctorId },
        data: { rating: Math.round(avgRating * 10) / 10 } // Round to 1 decimal
    });
};

module.exports = { createReview, getDoctorReviews };
