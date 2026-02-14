const prisma = require('../services/prismaClient');

/**
 * Get user profile (with role-specific data)
 * GET /api/users/profile
 */
const getProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            include: {
                doctorProfile: true,
                patientProfile: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Remove password from response
        const { password, ...userWithoutPassword } = user;

        res.json({ user: userWithoutPassword });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Update user profile
 * PUT /api/users/profile
 */
const updateProfile = async (req, res) => {
    try {
        const { name, dateOfBirth, bloodGroup, allergies, medicalHistory, bio, location } = req.body;
        const userId = req.user.userId;

        // Update user basic info
        const updateData = {};
        if (name) updateData.name = name;

        const user = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            include: {
                doctorProfile: true,
                patientProfile: true,
            },
        });

        // Update role-specific profile
        if (user.role === 'PATIENT' && user.patientProfile) {
            const patientUpdateData = {};
            if (dateOfBirth) patientUpdateData.dateOfBirth = new Date(dateOfBirth);
            if (bloodGroup) patientUpdateData.bloodGroup = bloodGroup;
            if (allergies) patientUpdateData.allergies = allergies;
            if (medicalHistory !== undefined) patientUpdateData.medicalHistory = medicalHistory;

            if (Object.keys(patientUpdateData).length > 0) {
                await prisma.patientProfile.update({
                    where: { userId },
                    data: patientUpdateData,
                });
            }
        } else if (user.role === 'DOCTOR' && user.doctorProfile) {
            const doctorUpdateData = {};
            if (bio !== undefined) doctorUpdateData.bio = bio;
            if (location) doctorUpdateData.location = location;

            if (Object.keys(doctorUpdateData).length > 0) {
                await prisma.doctorProfile.update({
                    where: { userId },
                    data: doctorUpdateData,
                });
            }
        }

        // Fetch updated user
        const updatedUser = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                doctorProfile: true,
                patientProfile: true,
            },
        });

        const { password, ...userWithoutPassword } = updatedUser;

        res.json({
            message: 'Profile updated successfully',
            user: userWithoutPassword,
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Get all users (Admin only)
 * GET /api/users/all
 */
const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                doctorProfile: {
                    select: {
                        specialization: true,
                        isVerified: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.json({ users });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Delete user (Admin only)
 * DELETE /api/users/:id
 */
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent admin from deleting themselves
        if (id === req.user.userId) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }

        await prisma.user.delete({
            where: { id },
        });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    getAllUsers,
    deleteUser,
};
