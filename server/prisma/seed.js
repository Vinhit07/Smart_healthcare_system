const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // Clear existing data (optional - remove in production)
    console.log('Clearing existing data...');
    await prisma.chatSession.deleteMany();
    await prisma.symptomLog.deleteMany();
    await prisma.prescription.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.doctorProfile.deleteMany();
    await prisma.patientProfile.deleteMany();
    await prisma.user.deleteMany();

    // Hash password for all users
    const hashedPassword = await bcrypt.hash('Password@123', 12);

    // Create Admin User
    const admin = await prisma.user.create({
        data: {
            email: 'admin@healthcare.com',
            password: hashedPassword,
            name: 'Admin User',
            role: 'ADMIN',
        },
    });
    console.log('✅ Created admin user');

    // Create Doctor Users
    const doctor1 = await prisma.user.create({
        data: {
            email: 'dr.sarah@healthcare.com',
            password: hashedPassword,
            name: 'Dr. Sarah Johnson',
            role: 'DOCTOR',
            doctorProfile: {
                create: {
                    specialization: 'Cardiology',
                    experience: 15,
                    location: 'New York, NY',
                    bio: 'Experienced cardiologist specializing in heart disease prevention and treatment.',
                    rating: 4.8,
                    isVerified: true,
                    availableSlots: [
                        { day: 'Monday', slots: ['09:00-10:00', '10:00-11:00', '14:00-15:00', '15:00-16:00'] },
                        { day: 'Wednesday', slots: ['09:00-10:00', '11:00-12:00', '14:00-15:00'] },
                        { day: 'Friday', slots: ['09:00-10:00', '10:00-11:00', '13:00-14:00'] },
                    ],
                },
            },
        },
    });

    const doctor2 = await prisma.user.create({
        data: {
            email: 'dr.john@healthcare.com',
            password: hashedPassword,
            name: 'Dr. John Smith',
            role: 'DOCTOR',
            doctorProfile: {
                create: {
                    specialization: 'Neurology',
                    experience: 20,
                    location: 'Los Angeles, CA',
                    bio: 'Neurologist with expertise in brain disorders and neurological conditions.',
                    rating: 4.9,
                    isVerified: true,
                    availableSlots: [
                        { day: 'Tuesday', slots: ['10:00-11:00', '11:00-12:00', '15:00-16:00'] },
                        { day: 'Thursday', slots: ['09:00-10:00', '14:00-15:00', '16:00-17:00'] },
                    ],
                },
            },
        },
    });

    const doctor3 = await prisma.user.create({
        data: {
            email: 'dr.emily@healthcare.com',
            password: hashedPassword,
            name: 'Dr. Emily Davis',
            role: 'DOCTOR',
            doctorProfile: {
                create: {
                    specialization: 'General Medicine',
                    experience: 10,
                    location: 'Chicago, IL',
                    bio: 'General practitioner providing comprehensive primary care services.',
                    rating: 4.7,
                    isVerified: true,
                    availableSlots: [
                        { day: 'Monday', slots: ['08:00-09:00', '09:00-10:00', '10:00-11:00'] },
                        { day: 'Tuesday', slots: ['08:00-09:00', '13:00-14:00', '14:00-15:00'] },
                        { day: 'Wednesday', slots: ['09:00-10:00', '11:00-12:00'] },
                        { day: 'Friday', slots: ['08:00-09:00', '10:00-11:00', '15:00-16:00'] },
                    ],
                },
            },
        },
    });
    console.log('✅ Created 3 doctor users with profiles');

    // Create Patient Users
    const patient1 = await prisma.user.create({
        data: {
            email: 'patient1@healthcare.com',
            password: hashedPassword,
            name: 'Michael Brown',
            role: 'PATIENT',
            patientProfile: {
                create: {
                    dateOfBirth: new Date('1985-03-15'),
                    bloodGroup: 'A+',
                    allergies: ['Penicillin', 'Peanuts'],
                    medicalHistory: 'No major medical history. Had appendectomy in 2010.',
                },
            },
        },
    });

    const patient2 = await prisma.user.create({
        data: {
            email: 'patient2@healthcare.com',
            password: hashedPassword,
            name: 'Jennifer Wilson',
            role: 'PATIENT',
            patientProfile: {
                create: {
                    dateOfBirth: new Date('1992-07-22'),
                    bloodGroup: 'O+',
                    allergies: ['Latex'],
                    medicalHistory: 'Diagnosed with mild asthma in childhood. Currently managed well.',
                },
            },
        },
    });
    console.log('✅ Created 2 patient users with profiles');

    // Create Appointments
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const appointment1 = await prisma.appointment.create({
        data: {
            patientId: patient1.id,
            doctorId: doctor1.id,
            date: tomorrow,
            timeSlot: '09:00-10:00',
            reason: 'Chest pain and shortness of breath',
            status: 'CONFIRMED',
        },
    });

    const appointment2 = await prisma.appointment.create({
        data: {
            patientId: patient2.id,
            doctorId: doctor3.id,
            date: tomorrow,
            timeSlot: '10:00-11:00',
            reason: 'Annual checkup',
            status: 'PENDING',
        },
    });

    const appointment3 = await prisma.appointment.create({
        data: {
            patientId: patient1.id,
            doctorId: doctor2.id,
            date: nextWeek,
            timeSlot: '10:00-11:00',
            reason: 'Persistent headaches',
            status: 'CONFIRMED',
        },
    });

    const appointment4 = await prisma.appointment.create({
        data: {
            patientId: patient2.id,
            doctorId: doctor1.id,
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last week
            timeSlot: '14:00-15:00',
            reason: 'Follow-up consultation',
            status: 'COMPLETED',
        },
    });

    const appointment5 = await prisma.appointment.create({
        data: {
            patientId: patient1.id,
            doctorId: doctor3.id,
            date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // Two weeks ago
            timeSlot: '09:00-10:00',
            reason: 'Flu symptoms',
            status: 'COMPLETED',
        },
    });
    console.log('✅ Created 5 appointments');

    // Create Prescriptions
    const today = new Date();
    const in30Days = new Date();
    in30Days.setDate(in30Days.getDate() + 30);

    const in15Days = new Date();
    in15Days.setDate(in15Days.getDate() + 15);

    const in5Days = new Date();
    in5Days.setDate(in5Days.getDate() + 5);

    await prisma.prescription.create({
        data: {
            patientId: patient1.id,
            doctorId: doctor1.id,
            appointmentId: appointment4.id,
            medicationName: 'Lisinopril',
            dosage: '10mg',
            frequency: 'Once daily',
            startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            endDate: in30Days,
            notes: 'Take in the morning with food. Monitor blood pressure.',
        },
    });

    await prisma.prescription.create({
        data: {
            patientId: patient1.id,
            doctorId: doctor3.id,
            appointmentId: appointment5.id,
            medicationName: 'Amoxicillin',
            dosage: '500mg',
            frequency: 'Three times daily',
            startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
            endDate: in5Days,
            notes: 'Complete the full course. Take after meals.',
        },
    });

    await prisma.prescription.create({
        data: {
            patientId: patient2.id,
            doctorId: doctor1.id,
            medicationName: 'Atorvastatin',
            dosage: '20mg',
            frequency: 'Once daily at bedtime',
            startDate: today,
            endDate: in30Days,
            notes: 'For cholesterol management. Avoid grapefruit juice.',
        },
    });

    await prisma.prescription.create({
        data: {
            patientId: patient2.id,
            doctorId: doctor3.id,
            medicationName: 'Salbutamol Inhaler',
            dosage: '100mcg',
            frequency: 'As needed (max 4 times daily)',
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate: in15Days,
            notes: 'Use when experiencing asthma symptoms. Rinse mouth after use.',
        },
    });
    console.log('✅ Created 4 prescriptions');

    console.log('🎉 Seed completed successfully!');
    console.log('\n📧 Login Credentials:');
    console.log('Admin: admin@healthcare.com / Password@123');
    console.log('Doctor 1: dr.sarah@healthcare.com / Password@123');
    console.log('Doctor 2: dr.john@healthcare.com / Password@123');
    console.log('Doctor 3: dr.emily@healthcare.com / Password@123');
    console.log('Patient 1: patient1@healthcare.com / Password@123');
    console.log('Patient 2: patient2@healthcare.com / Password@123');

    // Create more Doctors to reach 15+
    const specializations = ['Dermatology', 'Pediatrics', 'Orthopedics', 'Psychiatry', 'Ophthalmology', 'ENT', 'Gynecology', 'Urology', 'Oncology', 'Endocrinology'];
    const locations = ['San Francisco, CA', 'Boston, MA', 'Seattle, WA', 'Austin, TX', 'Miami, FL', 'Denver, CO'];

    for (let i = 4; i <= 16; i++) {
        await prisma.user.create({
            data: {
                email: `dr.doctor${i}@healthcare.com`,
                password: hashedPassword,
                name: `Dr. Specialist ${i}`,
                role: 'DOCTOR',
                doctorProfile: {
                    create: {
                        specialization: specializations[i % specializations.length],
                        experience: 5 + (i % 20),
                        location: locations[i % locations.length],
                        bio: `Experienced specialist in ${specializations[i % specializations.length]} committed to patient care.`,
                        rating: 4.0 + (i % 10) / 10,
                        isVerified: true,
                        availableSlots: [
                            { day: 'Monday', slots: ['09:00-12:00'] },
                            { day: 'Thursday', slots: ['14:00-17:00'] },
                        ],
                    },
                },
            },
        });
    }
    console.log('✅ Created 13 additional doctor users (Total 16)');

    // Seeding FAQs
    const faqs = [
        {
            question: "How do I book an appointment?",
            answer: "You can book an appointment by navigating to the 'Book Appointment' section on your dashboard, selecting a doctor, and choosing an available time slot.",
            category: "Appointments"
        },
        {
            question: "Is my medical data secure?",
            answer: "Yes, we use industry-standard encryption to protect your personal and medical information. Your privacy is our top priority.",
            category: "Privacy & Security"
        },
        {
            question: "Can I cancel or reschedule an appointment?",
            answer: "Yes, you can cancel or reschedule appointments from the 'My Appointments' section up to 24 hours before the scheduled time.",
            category: "Appointments"
        },
        {
            question: "How does the AI Symptom Checker work?",
            answer: "Our AI analyzes the symptoms you enter and compares them against a vast medical database to suggest possible conditions and recommended specialists. It is for informational purposes only and not a diagnosis.",
            category: "AI Features"
        },
        {
            question: "What should I do in an emergency?",
            answer: "If you are experiencing a medical emergency, please call your local emergency services immediately. Do not rely on this platform for emergency care.",
            category: "General"
        },
        {
            question: "How can I contact a doctor?",
            answer: "Once you book an appointment, you can communicate with your doctor through the platform during your scheduled consultation time.",
            category: "Consultations"
        },
        {
            question: "Are online prescriptions valid?",
            answer: "Yes, prescriptions issued by our verified doctors are valid and can be used at any pharmacy.",
            category: "Prescriptions"
        },
        {
            question: "How do I reset my password?",
            answer: "You can reset your password by clicking on the 'Forgot Password' link on the login page and following the instructions sent to your email.",
            category: "Account"
        },
        {
            question: "Can I add family members to my account?",
            answer: "Currently, each adult must have their own account. We are working on a family profile feature for future updates.",
            category: "Account"
        }
    ];

    for (const faq of faqs) {
        await prisma.fAQ.create({ data: faq });
    }
    console.log('✅ Created 10 FAQs');

    // Seed Support Tickets
    const tickets = [
        {
            userId: patient1.id,
            subject: "Appointment Cancellation Issue",
            message: "I tried to cancel my appointment but received an error message. Please assist.",
            status: "OPEN"
        },
        {
            userId: patient1.id,
            subject: "Prescription Renewal",
            message: "How can I request a renewal for my current prescription without a new appointment?",
            status: "CLOSED",
            response: "You can request a renewal directly from the Prescriptions tab. If not available, please book a short consultation."
        },
        {
            userId: patient2.id,
            subject: "Update Profile Information",
            message: "I need to update my insurance details in my profile.",
            status: "IN_PROGRESS"
        },
        {
            userId: patient2.id,
            subject: "Login Issues on Mobile",
            message: "I am unable to login to the mobile app with my credentials.",
            status: "OPEN"
        }
    ];

    for (const ticket of tickets) {
        await prisma.supportTicket.create({ data: ticket });
    }
    console.log('✅ Created 4 support tickets');
}



main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
