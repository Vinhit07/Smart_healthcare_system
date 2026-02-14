import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Search, MapPin, Star, Calendar } from 'lucide-react';
import Navbar from '../../components/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner';
import Badge from '../../components/Badge';
import { doctorService, appointmentService } from '../../services';
import { format } from 'date-fns';

const AppointmentBooking = () => {
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [bookingData, setBookingData] = useState({ date: '', timeSlot: '', reason: '' });
    const [filters, setFilters] = useState({ specialization: '', location: '' });
    const queryClient = useQueryClient();

    const { data: doctorsData, isLoading: doctorsLoading } = useQuery({
        queryKey: ['doctors', filters],
        queryFn: () => doctorService.getAllDoctors(filters),
    });

    const { data: appointmentsData } = useQuery({
        queryKey: ['appointments'],
        queryFn: appointmentService.getMyAppointments,
    });

    const bookMutation = useMutation({
        mutationFn: (data) => appointmentService.createAppointment(data),
        onSuccess: () => {
            toast.success('Appointment booked successfully!');
            setSelectedDoctor(null);
            setBookingData({ date: '', timeSlot: '', reason: '' });
            queryClient.invalidateQueries(['appointments']);
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Booking failed');
        },
    });

    const cancelMutation = useMutation({
        mutationFn: (id) => appointmentService.updateAppointmentStatus(id, 'CANCELLED'),
        onSuccess: () => {
            toast.success('Appointment cancelled');
            queryClient.invalidateQueries(['appointments']);
        },
        onError: () => toast.error('Failed to cancel appointment'),
    });

    const handleBooking = (e) => {
        e.preventDefault();
        if (!selectedDoctor || !bookingData.date || !bookingData.timeSlot || !bookingData.reason) {
            toast.error('Please fill all fields');
            return;
        }
        bookMutation.mutate({
            doctorId: selectedDoctor.id,
            ...bookingData,
        });
    };

    const doctors = doctorsData?.doctors || [];
    const appointments = appointmentsData?.appointments || [];

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-8">Book Appointment</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Doctor List */}
                    <div className="lg:col-span-2">
                        {/* Filters */}
                        <div className="card mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="label">
                                        <Search className="h-4 w-4 inline mr-2" />
                                        Specialization
                                    </label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="e.g., Cardiology"
                                        value={filters.specialization}
                                        onChange={(e) => setFilters({ ...filters, specialization: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="label">
                                        <MapPin className="h-4 w-4 inline mr-2" />
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="e.g., New York"
                                        value={filters.location}
                                        onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Doctor Cards */}
                        {doctorsLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {doctors.map((doctor) => (
                                    <div key={doctor.id} className="card hover:shadow-lg transition">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="font-bold text-lg text-slate-900">{doctor.name}</h3>
                                                <p className="text-indigo-600 font-medium text-sm">
                                                    {doctor.doctorProfile.specialization}
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-1 text-sm">
                                                <Star className="h-4 w-4 text-amber-500 fill-current" />
                                                <span className="font-medium">{doctor.doctorProfile.rating}</span>
                                            </div>
                                        </div>
                                        <div className="text-sm text-slate-600 space-y-1 mb-4">
                                            <p>📍 {doctor.doctorProfile.location}</p>
                                            <p>💼 {doctor.doctorProfile.experience} years experience</p>
                                            <p className="text-xs mt-2">{doctor.doctorProfile.bio}</p>
                                        </div>
                                        <button
                                            onClick={() => setSelectedDoctor(doctor)}
                                            className="btn-primary w-full text-sm"
                                        >
                                            Book Appointment
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Booking Form & My Appointments */}
                    <div className="space-y-6">
                        {/* Booking Form */}
                        {selectedDoctor && (
                            <div className="card">
                                <h3 className="font-bold text-lg mb-4">Book with {selectedDoctor.name}</h3>
                                <form onSubmit={handleBooking} className="space-y-4">
                                    <div>
                                        <label className="label">Date</label>
                                        <input
                                            type="date"
                                            className="input"
                                            value={bookingData.date}
                                            onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Time Slot</label>
                                        <select
                                            className="input"
                                            value={bookingData.timeSlot}
                                            onChange={(e) => setBookingData({ ...bookingData, timeSlot: e.target.value })}
                                        >
                                            <option value="">Select time</option>
                                            <option value="09:00-10:00">09:00 - 10:00</option>
                                            <option value="10:00-11:00">10:00 - 11:00</option>
                                            <option value="11:00-12:00">11:00 - 12:00</option>
                                            <option value="14:00-15:00">14:00 - 15:00</option>
                                            <option value="15:00-16:00">15:00 - 16:00</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="label">Reason for Visit</label>
                                        <textarea
                                            className="input"
                                            rows="3"
                                            value={bookingData.reason}
                                            onChange={(e) => setBookingData({ ...bookingData, reason: e.target.value })}
                                            placeholder="Describe your symptoms..."
                                        />
                                    </div>
                                    <button type="submit" disabled={bookMutation.isPending} className="btn-primary w-full">
                                        {bookMutation.isPending ? 'Booking...' : 'Confirm Booking'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedDoctor(null)}
                                        className="btn-outline w-full"
                                    >
                                        Cancel
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* My Appointments */}
                        <div className="card">
                            <h3 className="font-bold text-lg mb-4">My Appointments</h3>
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {appointments.slice(0, 5).map((apt) => (
                                    <div key={apt.id} className="border border-slate-200 rounded-lg p-3">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-semibold text-sm">Dr. {apt.doctor.name}</h4>
                                            <Badge status={apt.status} />
                                        </div>
                                        <p className="text-xs text-slate-600">
                                            {format(new Date(apt.date), 'MMM dd, yyyy')} • {apt.timeSlot}
                                        </p>
                                        {apt.status === 'PENDING' && (
                                            <button
                                                onClick={() => cancelMutation.mutate(apt.id)}
                                                className="text-xs text-red-600 hover:text-red-700 mt-2"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppointmentBooking;
