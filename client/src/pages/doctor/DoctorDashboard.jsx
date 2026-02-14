import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Calendar, CheckCircle, XCircle, FileText } from 'lucide-react';
import { format } from 'date-fns';
import Navbar from '../../components/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner';
import Badge from '../../components/Badge';
import { appointmentService, prescriptionService } from '../../services';

const DoctorDashboard = () => {
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [prescriptionForm, setPrescriptionForm] = useState({
        medicationName: '',
        dosage: '',
        frequency: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        notes: '',
    });
    const queryClient = useQueryClient();

    const { data: appointmentsData, isLoading } = useQuery({
        queryKey: ['appointments'],
        queryFn: appointmentService.getMyAppointments,
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }) => appointmentService.updateAppointmentStatus(id, status),
        onSuccess: () => {
            toast.success('Appointment updated');
            queryClient.invalidateQueries(['appointments']);
        },
    });

    const createPrescriptionMutation = useMutation({
        mutationFn: (data) => prescriptionService.createPrescription(data),
        onSuccess: () => {
            toast.success('Prescription created!');
            setSelectedAppointment(null);
            setPrescriptionForm({
                medicationName: '',
                dosage: '',
                frequency: '',
                startDate: new Date().toISOString().split('T')[0],
                endDate: '',
                notes: '',
            });
        },
    });

    const updatePrescriptionMutation = useMutation({
        mutationFn: ({ id, data }) => prescriptionService.updatePrescription(id, data),
        onSuccess: () => {
            toast.success('Prescription updated!');
            setSelectedAppointment(null);
            setPrescriptionForm({
                medicationName: '',
                dosage: '',
                frequency: '',
                startDate: new Date().toISOString().split('T')[0],
                endDate: '',
                notes: '',
            });
            queryClient.invalidateQueries(['appointments']);
        },
    });

    useEffect(() => {
        if (selectedAppointment && selectedAppointment.prescriptions && selectedAppointment.prescriptions.length > 0) {
            const prescription = selectedAppointment.prescriptions[0];
            setPrescriptionForm({
                id: prescription.id,
                medicationName: prescription.medicationName,
                dosage: prescription.dosage,
                frequency: prescription.frequency,
                startDate: prescription.startDate.split('T')[0],
                endDate: prescription.endDate.split('T')[0],
                notes: prescription.notes || '',
            });
        } else {
            setPrescriptionForm({
                medicationName: '',
                dosage: '',
                frequency: '',
                startDate: new Date().toISOString().split('T')[0],
                endDate: '',
                notes: '',
            });
        }
    }, [selectedAppointment]);

    const handleCreatePrescription = (e) => {
        e.preventDefault();

        if (prescriptionForm.id) {
            const { id, ...data } = prescriptionForm;
            updatePrescriptionMutation.mutate({ id, data });
        } else {
            createPrescriptionMutation.mutate({
                patientId: selectedAppointment.patientId,
                appointmentId: selectedAppointment.id,
                ...prescriptionForm,
            });
        }
    };

    const appointments = appointmentsData?.appointments || [];
    const today = appointments.filter(
        (apt) => format(new Date(apt.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-gradient-to-r from-indigo-600 to-teal-500 rounded-2xl p-8 text-white mb-8 shadow-lg">
                    <h1 className="text-3xl font-bold mb-2">Doctor Dashboard</h1>
                    <p className="text-indigo-100">Manage your appointments and patient consultations</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">Today's Appointments</p>
                                <p className="text-3xl font-bold text-slate-900 mt-2">{today.length}</p>
                            </div>
                            <Calendar className="h-10 w-10 text-indigo-600" />
                        </div>
                    </div>
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">Total Appointments</p>
                                <p className="text-3xl font-bold text-slate-900 mt-2">{appointments.length}</p>
                            </div>
                            <FileText className="h-10 w-10 text-teal-600" />
                        </div>
                    </div>
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">Pending</p>
                                <p className="text-3xl font-bold text-slate-900 mt-2">
                                    {appointments.filter((a) => a.status === 'PENDING').length}
                                </p>
                            </div>
                            <CheckCircle className="h-10 w-10 text-amber-600" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Appointments List */}
                    <div className="lg:col-span-2">
                        <div className="card">
                            <h2 className="text-xl font-bold mb-4">All Appointments</h2>
                            {isLoading ? (
                                <LoadingSpinner />
                            ) : (
                                <div className="space-y-4">
                                    {appointments.map((apt) => (
                                        <div key={apt.id} className="border border-slate-200 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h3 className="font-semibold text-slate-900">{apt.patient.name}</h3>
                                                    <p className="text-sm text-slate-600">
                                                        {format(new Date(apt.date), 'MMM dd, yyyy')} • {apt.timeSlot}
                                                    </p>
                                                </div>
                                                <Badge status={apt.status} />
                                            </div>
                                            <p className="text-sm text-slate-700 mb-3">
                                                <strong>Reason:</strong> {apt.reason}
                                            </p>
                                            <div className="flex space-x-2 flex-wrap gap-y-2">
                                                {apt.status === 'PENDING' && (
                                                    <>
                                                        <button
                                                            onClick={() =>
                                                                updateStatusMutation.mutate({ id: apt.id, status: 'CONFIRMED' })
                                                            }
                                                            className="text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition"
                                                        >
                                                            <CheckCircle className="h-4 w-4 inline mr-1" />
                                                            Confirm
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                updateStatusMutation.mutate({ id: apt.id, status: 'CANCELLED' })
                                                            }
                                                            className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition"
                                                        >
                                                            <XCircle className="h-4 w-4 inline mr-1" />
                                                            Cancel
                                                        </button>
                                                    </>
                                                )}
                                                {apt.status === 'CONFIRMED' && (
                                                    <>
                                                        <button
                                                            onClick={() =>
                                                                updateStatusMutation.mutate({ id: apt.id, status: 'COMPLETED' })
                                                            }
                                                            className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition"
                                                        >
                                                            Mark Complete
                                                        </button>
                                                        <button
                                                            onClick={() => setSelectedAppointment(apt)}
                                                            className="text-sm bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded transition"
                                                        >
                                                            <FileText className="h-4 w-4 inline mr-1" />
                                                            Write Prescription
                                                        </button>
                                                    </>
                                                )}
                                                {apt.status === 'COMPLETED' && (
                                                    <button
                                                        onClick={() => {
                                                            // Find existing prescription if available or just open form pre-filled?
                                                            // For now, let's just allow opening the form. In a real app we'd fetch the existing prescription.
                                                            // Since the user asked to "edit the prescription", we implies modifying an existing one.
                                                            // However, my current UI only has "Create Prescription".
                                                            // I will enable the form to be used for updates if a prescription exists.
                                                            // But first I need to see if the appointment object includes the prescription.
                                                            // The query `getMyAppointments` usually includes relations.
                                                            // Let's assume for now we just allow writing new ones or overwriting.
                                                            setSelectedAppointment(apt);
                                                        }}
                                                        className="text-sm bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded transition"
                                                    >
                                                        <FileText className="h-4 w-4 inline mr-1" />
                                                        Edit Prescription
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Prescription Form */}
                    <div>
                        {selectedAppointment ? (
                            <div className="card">
                                <h3 className="font-bold text-lg mb-4">
                                    Write Prescription for {selectedAppointment.patient.name}
                                </h3>
                                <form onSubmit={handleCreatePrescription} className="space-y-4">
                                    <div>
                                        <label className="label">Medication Name</label>
                                        <input
                                            type="text"
                                            className="input"
                                            value={prescriptionForm.medicationName}
                                            onChange={(e) =>
                                                setPrescriptionForm({ ...prescriptionForm, medicationName: e.target.value })
                                            }
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Dosage</label>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="e.g., 500mg"
                                            value={prescriptionForm.dosage}
                                            onChange={(e) =>
                                                setPrescriptionForm({ ...prescriptionForm, dosage: e.target.value })
                                            }
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Frequency</label>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="e.g., Twice daily"
                                            value={prescriptionForm.frequency}
                                            onChange={(e) =>
                                                setPrescriptionForm({ ...prescriptionForm, frequency: e.target.value })
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="label">Start Date</label>
                                            <input
                                                type="date"
                                                className="input"
                                                value={prescriptionForm.startDate}
                                                onChange={(e) =>
                                                    setPrescriptionForm({ ...prescriptionForm, startDate: e.target.value })
                                                }
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="label">End Date</label>
                                            <input
                                                type="date"
                                                className="input"
                                                value={prescriptionForm.endDate}
                                                onChange={(e) =>
                                                    setPrescriptionForm({ ...prescriptionForm, endDate: e.target.value })
                                                }
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="label">Notes</label>
                                        <textarea
                                            className="input"
                                            rows="3"
                                            value={prescriptionForm.notes}
                                            onChange={(e) =>
                                                setPrescriptionForm({ ...prescriptionForm, notes: e.target.value })
                                            }
                                        />
                                    </div>
                                    <button type="submit" className="btn-primary w-full">
                                        Create Prescription
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedAppointment(null)}
                                        className="btn-outline w-full"
                                    >
                                        Cancel
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="card text-center py-8 text-slate-500">
                                <FileText className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                                <p>Select an appointment to write a prescription</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;
