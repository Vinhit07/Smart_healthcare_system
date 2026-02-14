const prisma = require('../services/prismaClient');
const { validationResult } = require('express-validator');

/**
 * Create appointment (Patient only)
 * POST /api/appointments
 */
const createAppointment = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { doctorId, date, timeSlot, reason } = req.body;
        const patientId = req.user.userId;

        // Verify user is a patient
        const user = await prisma.user.findUnique({ where: { id: patientId } });
        if (user.role !== 'PATIENT') {
            return res.status(403).json({ error: 'Only patients can book appointments' });
        }

        // Verify doctor exists and is verified
        const doctor = await prisma.user.findFirst({
            where: {
                id: doctorId,
                role: 'DOCTOR',
            },
            include: { doctorProfile: true },
        });

        if (!doctor || !doctor.doctorProfile) {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        if (!doctor.doctorProfile.isVerified) {
            return res.status(400).json({ error: 'Doctor is not verified' });
        }

        // Check if time slot is available (basic check)
        const existingAppointment = await prisma.appointment.findFirst({
            where: {
                doctorId,
                date: new Date(date),
                timeSlot,
                status: {
                    not: 'CANCELLED',
                },
            },
        });

        if (existingAppointment) {
            return res.status(400).json({ error: 'Time slot is already booked' });
        }

        // Create appointment
        const appointment = await prisma.appointment.create({
            data: {
                patientId,
                doctorId,
                date: new Date(date),
                timeSlot,
                reason,
                status: 'PENDING',
            },
            include: {
                patient: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                doctor: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        doctorProfile: {
                            select: {
                                specialization: true,
                            },
                        },
                    },
                },
            },
        });

        res.status(201).json({
            message: 'Appointment booked successfully',
            appointment,
        });
    } catch (error) {
        console.error('Create appointment error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Get my appointments (Patient or Doctor)
 * GET /api/appointments/my
 */
const getMyAppointments = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { role } = req.user;

        const whereClause = role === 'DOCTOR' ? { doctorId: userId } : { patientId: userId };

        const appointments = await prisma.appointment.findMany({
            where: whereClause,
            include: {
                patient: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        patientProfile: true,
                    },
                },
                doctor: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        doctorProfile: {
                            select: {
                                specialization: true,
                                location: true,
                            },
                        },
                    },
                },
                prescriptions: true,
            },
            orderBy: {
                date: 'desc',
            },
        });

        res.json({ appointments });
    } catch (error) {
        console.error('Get my appointments error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Update appointment status
 * PUT /api/appointments/:id/status
 */
const updateAppointmentStatus = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user.userId;
        const { role } = req.user;

        // Find appointment
        const appointment = await prisma.appointment.findUnique({ where: { id } });

        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        // Authorization check
        if (role === 'PATIENT' && appointment.patientId !== userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        if (role === 'DOCTOR' && appointment.doctorId !== userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Patients can only cancel, doctors can confirm/cancel/complete
        if (role === 'PATIENT' && status !== 'CANCELLED') {
            return res.status(403).json({ error: 'Patients can only cancel appointments' });
        }

        // Update status
        const updatedAppointment = await prisma.appointment.update({
            where: { id },
            data: { status },
            include: {
                patient: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                doctor: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        res.json({
            message: 'Appointment status updated',
            appointment: updatedAppointment,
        });
    } catch (error) {
        console.error('Update appointment status error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Get all appointments (Admin only)
 * GET /api/appointments
 */
const getAllAppointments = async (req, res) => {
    try {
        const appointments = await prisma.appointment.findMany({
            include: {
                patient: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                doctor: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        doctorProfile: {
                            select: {
                                specialization: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                date: 'desc',
            },
        });

        res.json({ appointments });
    } catch (error) {
        console.error('Get all appointments error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    createAppointment,
    getMyAppointments,
    updateAppointmentStatus,
    getAllAppointments,
};
