const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get analytics data for admin dashboard
const getAnalytics = async (req, res) => {
    try {
        // 1. Appointments by date (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const appointments = await prisma.appointment.findMany({
            where: {
                date: {
                    gte: thirtyDaysAgo
                }
            },
            select: {
                date: true,
                status: true
            }
        });

        // Group appointments by date
        const appointmentsByDate = appointments.reduce((acc, apt) => {
            const dateKey = new Date(apt.date).toISOString().split('T')[0];
            if (!acc[dateKey]) {
                acc[dateKey] = { date: dateKey, count: 0, completed: 0, cancelled: 0 };
            }
            acc[dateKey].count++;
            if (apt.status === 'COMPLETED') acc[dateKey].completed++;
            if (apt.status === 'CANCELLED') acc[dateKey].cancelled++;
            return acc;
        }, {});

        // 2. Symptom distribution (most common symptoms)
        const symptomLogs = await prisma.symptomLog.findMany({
            select: {
                symptoms: true,
                predictedDisease: true
            }
        });

        const symptomDistribution = symptomLogs.reduce((acc, log) => {
            const symptoms = log.symptoms;
            symptoms.forEach(symptom => {
                if (!acc[symptom]) {
                    acc[symptom] = { symptom, count: 0 };
                }
                acc[symptom].count++;
            });
            return acc;
        }, {});

        const topSymptoms = Object.values(symptomDistribution)
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        // 3. Doctor utilization rates
        const doctors = await prisma.user.findMany({
            where: { role: 'DOCTOR' },
            include: {
                doctorProfile: true,
                doctorAppointments: {
                    where: {
                        status: {
                            in: ['CONFIRMED', 'COMPLETED']
                        }
                    }
                }
            }
        });

        const doctorUtilization = doctors.map(doctor => ({
            name: doctor.name,
            specialization: doctor.doctorProfile?.specialization || 'General',
            appointmentCount: doctor.doctorAppointments.length,
            rating: doctor.doctorProfile?.rating || 0
        })).sort((a, b) => b.appointmentCount - a.appointmentCount);

        // 4. Patient growth (registrations over time)
        const patients = await prisma.user.findMany({
            where: { role: 'PATIENT' },
            select: {
                createdAt: true
            }
        });

        const patientGrowth = patients.reduce((acc, patient) => {
            const monthKey = new Date(patient.createdAt).toISOString().slice(0, 7); // YYYY-MM
            if (!acc[monthKey]) {
                acc[monthKey] = { month: monthKey, count: 0 };
            }
            acc[monthKey].count++;
            return acc;
        }, {});

        // 5. Disease prediction stats
        const predictionStats = symptomLogs.reduce((acc, log) => {
            if (!acc[log.predictedDisease]) {
                acc[log.predictedDisease] = { disease: log.predictedDisease, count: 0 };
            }
            acc[log.predictedDisease].count++;
            return acc;
        }, {});

        const topPredictions = Object.values(predictionStats)
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        res.json({
            appointmentsByDate: Object.values(appointmentsByDate).sort((a, b) => new Date(a.date) - new Date(b.date)),
            symptomDistribution: topSymptoms,
            doctorUtilization,
            patientGrowth: Object.values(patientGrowth).sort((a, b) => a.month.localeCompare(b.month)),
            predictionStats: topPredictions,
            summary: {
                totalAppointments: appointments.length,
                totalPatients: patients.length,
                totalDoctors: doctors.length,
                totalSymptomLogs: symptomLogs.length
            }
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics data' });
    }
};

module.exports = { getAnalytics };
