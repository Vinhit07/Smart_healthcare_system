const prisma = require('../services/prismaClient');
const { validationResult } = require('express-validator');

/**
 * Helper function to calculate days left for a prescription
 */
const calculateDaysLeft = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
};

/**
 * Create prescription (Doctor only)
 * POST /api/prescriptions
 */
const createPrescription = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            patientId,
            appointmentId,
            medicationName,
            dosage,
            frequency,
            startDate,
            endDate,
            notes,
        } = req.body;
        const doctorId = req.user.userId;

        // Verify user is a doctor
        const doctor = await prisma.user.findUnique({ where: { id: doctorId } });
        if (doctor.role !== 'DOCTOR') {
            return res.status(403).json({ error: 'Only doctors can create prescriptions' });
        }

        // Verify patient exists
        const patient = await prisma.user.findFirst({
            where: {
                id: patientId,
                role: 'PATIENT',
            },
        });

        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        // If appointmentId provided, verify it exists and doctor owns it
        if (appointmentId) {
            const appointment = await prisma.appointment.findFirst({
                where: {
                    id: appointmentId,
                    doctorId,
                },
            });

            if (!appointment) {
                return res.status(404).json({ error: 'Appointment not found or not authorized' });
            }
        }

        // Create prescription
        const prescription = await prisma.prescription.create({
            data: {
                patientId,
                doctorId,
                appointmentId: appointmentId || null,
                medicationName,
                dosage,
                frequency,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                notes: notes || null,
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
                    },
                },
            },
        });

        res.status(201).json({
            message: 'Prescription created successfully',
            prescription: {
                ...prescription,
                daysLeft: calculateDaysLeft(prescription.endDate),
            },
        });
    } catch (error) {
        console.error('Create prescription error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Get my prescriptions (Patient only)
 * GET /api/prescriptions/my
 */
const getMyPrescriptions = async (req, res) => {
    try {
        const patientId = req.user.userId;

        // Verify user is a patient
        const user = await prisma.user.findUnique({ where: { id: patientId } });
        if (user.role !== 'PATIENT') {
            return res.status(403).json({ error: 'Only patients can view their prescriptions' });
        }

        const prescriptions = await prisma.prescription.findMany({
            where: { patientId },
            include: {
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
                createdAt: 'desc',
            },
        });

        // Add daysLeft to each prescription
        const prescriptionsWithDaysLeft = prescriptions.map((prescription) => ({
            ...prescription,
            daysLeft: calculateDaysLeft(prescription.endDate),
        }));

        res.json({ prescriptions: prescriptionsWithDaysLeft });
    } catch (error) {
        console.error('Get my prescriptions error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Update prescription (Doctor only)
 * PUT /api/prescriptions/:id
 */
const updatePrescription = async (req, res) => {
    try {
        const { id } = req.params;
        const { medicationName, dosage, frequency, startDate, endDate, notes } = req.body;
        const doctorId = req.user.userId;

        // Find prescription
        const prescription = await prisma.prescription.findUnique({ where: { id } });

        if (!prescription) {
            return res.status(404).json({ error: 'Prescription not found' });
        }

        // Verify doctor owns this prescription
        if (prescription.doctorId !== doctorId) {
            return res.status(403).json({ error: 'Not authorized to update this prescription' });
        }

        // Update prescription
        const updateData = {};
        if (medicationName) updateData.medicationName = medicationName;
        if (dosage) updateData.dosage = dosage;
        if (frequency) updateData.frequency = frequency;
        if (startDate) updateData.startDate = new Date(startDate);
        if (endDate) updateData.endDate = new Date(endDate);
        if (notes !== undefined) updateData.notes = notes;

        const updatedPrescription = await prisma.prescription.update({
            where: { id },
            data: updateData,
            include: {
                patient: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        res.json({
            message: 'Prescription updated successfully',
            prescription: {
                ...updatedPrescription,
                daysLeft: calculateDaysLeft(updatedPrescription.endDate),
            },
        });
    } catch (error) {
        console.error('Update prescription error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Delete prescription (Doctor only)
 * DELETE /api/prescriptions/:id
 */
const deletePrescription = async (req, res) => {
    try {
        const { id } = req.params;
        const doctorId = req.user.userId;

        // Find prescription
        const prescription = await prisma.prescription.findUnique({ where: { id } });

        if (!prescription) {
            return res.status(404).json({ error: 'Prescription not found' });
        }

        // Verify doctor owns this prescription
        if (prescription.doctorId !== doctorId) {
            return res.status(403).json({ error: 'Not authorized to delete this prescription' });
        }

        // Delete prescription
        await prisma.prescription.delete({ where: { id } });

        res.json({ message: 'Prescription deleted successfully' });
    } catch (error) {
        console.error('Delete prescription error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    createPrescription,
    getMyPrescriptions,
    updatePrescription,
    deletePrescription,
};
