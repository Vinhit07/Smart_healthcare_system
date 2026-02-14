import { useQuery } from '@tanstack/react-query';
import { Calendar, Pill, Activity, MessageCircle, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import Badge from '../../components/Badge';
import { appointmentService, prescriptionService, doctorService } from '../../services';
import { format } from 'date-fns';

const PatientDashboard = () => {
    const { data: appointmentsData, isLoading: appointmentsLoading } = useQuery({
        queryKey: ['appointments'],
        queryFn: appointmentService.getMyAppointments,
    });

    const { data: prescriptionsData, isLoading: prescriptionsLoading } = useQuery({
        queryKey: ['prescriptions'],
        queryFn: prescriptionService.getMyPrescriptions,
    });

    const { data: doctorsData } = useQuery({
        queryKey: ['doctors'],
        queryFn: () => doctorService.getAllDoctors(),
    });

    const appointments = appointmentsData?.appointments || [];
    const prescriptions = prescriptionsData?.prescriptions || [];
    const doctorCount = doctorsData?.doctors?.length || 0;

    // Get upcoming appointments and active prescriptions
    const upcomingAppointments = appointments
        .filter((apt) => new Date(apt.date) >= new Date() && apt.status !== 'CANCELLED')
        .slice(0, 3);

    const activePrescriptions = prescriptions
        .filter((p) => p.daysLeft > 0)
        .slice(0, 3);

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Banner */}
                <div className="bg-gradient-to-r from-indigo-600 to-teal-500 rounded-2xl p-8 text-white mb-8 shadow-lg">
                    <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
                    <p className="text-indigo-100">
                        Manage your health, book appointments, and consult with our AI assistant
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card title="Total Appointments" value={appointments.length} icon={Calendar} />
                    <Card title="Active Prescriptions" value={activePrescriptions.length} icon={Pill} />
                    <Card title="AI Consultations" value={0} icon={Activity} />
                    <Card title="Doctors Available" value={doctorCount} icon={Users} />
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Upcoming Appointments */}
                    <div className="card">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-900">Upcoming Appointments</h2>
                            <Link to="/patient/appointments" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                                View All
                            </Link>
                        </div>
                        {appointmentsLoading ? (
                            <LoadingSpinner />
                        ) : upcomingAppointments.length > 0 ? (
                            <div className="space-y-4">
                                {upcomingAppointments.map((appointment) => (
                                    <div
                                        key={appointment.id}
                                        className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-semibold text-slate-900">
                                                    Dr. {appointment.doctor.name}
                                                </h3>
                                                <p className="text-sm text-slate-600">
                                                    {appointment.doctor.doctorProfile?.specialization}
                                                </p>
                                            </div>
                                            <Badge status={appointment.status} />
                                        </div>
                                        <div className="text-sm text-slate-600 space-y-1">
                                            <p>📅 {format(new Date(appointment.date), 'MMM dd, yyyy')}</p>
                                            <p>🕐 {appointment.timeSlot}</p>
                                            <p>📋 {appointment.reason}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500 text-center py-8">No upcoming appointments</p>
                        )}
                    </div>

                    {/* Active Prescriptions */}
                    <div className="card">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-900">Active Prescriptions</h2>
                            <Link to="/patient/prescriptions" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                                View All
                            </Link>
                        </div>
                        {prescriptionsLoading ? (
                            <LoadingSpinner />
                        ) : activePrescriptions.length > 0 ? (
                            <div className="space-y-4">
                                {activePrescriptions.map((prescription) => (
                                    <div
                                        key={prescription.id}
                                        className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition"
                                    >
                                        <h3 className="font-semibold text-slate-900 mb-2">
                                            {prescription.medicationName}
                                        </h3>
                                        <div className="text-sm text-slate-600 space-y-1">
                                            <p>💊 {prescription.dosage} - {prescription.frequency}</p>
                                            <p>👨‍⚕️ Dr. {prescription.doctor.name}</p>
                                        </div>
                                        <div className="mt-3">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-slate-600">Days remaining</span>
                                                <span className={prescription.daysLeft < 3 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                                                    {prescription.daysLeft} days
                                                </span>
                                            </div>
                                            <div className="w-full bg-slate-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${prescription.daysLeft < 3 ? 'bg-red-500' : prescription.daysLeft < 7 ? 'bg-amber-500' : 'bg-green-500'
                                                        }`}
                                                    style={{ width: `${Math.min((prescription.daysLeft / 30) * 100, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500 text-center py-8">No active prescriptions</p>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link to="/patient/appointments" className="card hover:shadow-lg transition group">
                        <div className="text-center">
                            <div className="bg-indigo-100 group-hover:bg-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition">
                                <Calendar className="h-8 w-8 text-indigo-600 group-hover:text-white transition" />
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-2">Book Appointment</h3>
                            <p className="text-sm text-slate-600">Find and book doctors</p>
                        </div>
                    </Link>

                    <Link to="/patient/symptom-checker" className="card hover:shadow-lg transition group">
                        <div className="text-center">
                            <div className="bg-teal-100 group-hover:bg-teal-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition">
                                <Activity className="h-8 w-8 text-teal-600 group-hover:text-white transition" />
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-2">Check Symptoms</h3>
                            <p className="text-sm text-slate-600">AI-powered analysis</p>
                        </div>
                    </Link>

                    <Link to="/patient/chatbot" className="card hover:shadow-lg transition group">
                        <div className="text-center">
                            <div className="bg-purple-100 group-hover:bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition">
                                <MessageCircle className="h-8 w-8 text-purple-600 group-hover:text-white transition" />
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-2">AI Assistant</h3>
                            <p className="text-sm text-slate-600">Health questions answered</p>
                        </div>
                    </Link>

                    <Link to="/patient/prescriptions" className="card hover:shadow-lg transition group">
                        <div className="text-center">
                            <div className="bg-amber-100 group-hover:bg-amber-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition">
                                <Pill className="h-8 w-8 text-amber-600 group-hover:text-white transition" />
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-2">Prescriptions</h3>
                            <p className="text-sm text-slate-600">Manage medications</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PatientDashboard;
