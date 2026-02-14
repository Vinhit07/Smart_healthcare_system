const prisma = require('../services/prismaClient');

/**
 * Get all doctors (with optional filters)
 * GET /api/doctors?specialization=&location=
 */
const getAllDoctors = async (req, res) => {
    try {
        const { specialization, location } = req.query;

        const whereClause = {
            role: 'DOCTOR',
            doctorProfile: {
                isVerified: true,
            },
        };

        // Build filter for doctor profile
        const doctorProfileWhere = {};
        if (specialization) {
            doctorProfileWhere.specialization = {
                contains: specialization,
                mode: 'insensitive',
            };
        }
        if (location) {
            doctorProfileWhere.location = {
                contains: location,
                mode: 'insensitive',
            };
        }

        const doctors = await prisma.user.findMany({
            where: {
                role: 'DOCTOR',
                doctorProfile: {
                    isVerified: true,
                    ...doctorProfileWhere,
                },
            },
            select: {
                id: true,
                name: true,
                email: true,
                doctorProfile: {
                    select: {
                        specialization: true,
                        experience: true,
                        location: true,
                        bio: true,
                        rating: true,
                        availableSlots: true,
                    },
                },
            },
            orderBy: {
                doctorProfile: {
                    rating: 'desc',
                },
            },
        });

        res.json({ doctors });
    } catch (error) {
        console.error('Get doctors error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Get single doctor by ID
 * GET /api/doctors/:id
 */
const getDoctorById = async (req, res) => {
    try {
        const { id } = req.params;

        const doctor = await prisma.user.findFirst({
            where: {
                id,
                role: 'DOCTOR',
            },
            select: {
                id: true,
                name: true,
                email: true,
                doctorProfile: true,
            },
        });

        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        res.json({ doctor });
    } catch (error) {
        console.error('Get doctor error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Update doctor availability (Doctor only)
 * PUT /api/doctors/availability
 */
const updateAvailability = async (req, res) => {
    try {
        const { availableSlots } = req.body;
        const userId = req.user.userId;

        // Verify user is a doctor
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { doctorProfile: true },
        });

        if (!user || user.role !== 'DOCTOR') {
            return res.status(403).json({ error: 'Only doctors can update availability' });
        }

        if (!user.doctorProfile) {
            return res.status(404).json({ error: 'Doctor profile not found' });
        }

        // Update availability
        const updatedProfile = await prisma.doctorProfile.update({
            where: { userId },
            data: { availableSlots },
        });

        res.json({
            message: 'Availability updated successfully',
            availableSlots: updatedProfile.availableSlots,
        });
    } catch (error) {
        console.error('Update availability error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Verify doctor (Admin only)
 * PUT /api/doctors/:id/verify
 */
const verifyDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const { isVerified } = req.body;

        // Find doctor
        const doctor = await prisma.user.findFirst({
            where: {
                id,
                role: 'DOCTOR',
            },
            include: { doctorProfile: true },
        });

        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        if (!doctor.doctorProfile) {
            return res.status(404).json({ error: 'Doctor profile not found' });
        }

        // Update verification status
        await prisma.doctorProfile.update({
            where: { userId: id },
            data: { isVerified: isVerified !== undefined ? isVerified : true },
        });

        res.json({ message: 'Doctor verification status updated' });
    } catch (error) {
        console.error('Verify doctor error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getAllDoctors,
    getDoctorById,
    updateAvailability,
    verifyDoctor,
};
