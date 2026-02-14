import { useQuery } from '@tanstack/react-query';
import { Pill, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import Navbar from '../../components/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { prescriptionService } from '../../services';

const PrescriptionsPage = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['prescriptions'],
        queryFn: prescriptionService.getMyPrescriptions,
    });

    const prescriptions = data?.prescriptions || [];

    const getUrgencyColor = (daysLeft) => {
        if (daysLeft < 3) return 'bg-red-500';
        if (daysLeft < 7) return 'bg-amber-500';
        return 'bg-green-500';
    };

    const getUrgencyText = (daysLeft) => {
        if (daysLeft < 3) return 'text-red-600';
        if (daysLeft < 7) return 'text-amber-600';
        return 'text-green-600';
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">My Prescriptions</h1>
                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <Pill className="h-5 w-5" />
                        <span>{prescriptions.length} total prescriptions</span>
                    </div>
                </div>

                {isLoading ? (
                    <LoadingSpinner />
                ) : prescriptions.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {prescriptions.map((prescription) => (
                            <div key={prescription.id} className="card hover:shadow-lg transition">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">
                                            {prescription.medicationName}
                                        </h3>
                                        <p className="text-sm text-slate-600">by Dr. {prescription.doctor.name}</p>
                                        <p className="text-xs text-indigo-600">
                                            {prescription.doctor.doctorProfile?.specialization}
                                        </p>
                                    </div>
                                    <div className="bg-indigo-100 p-2 rounded-lg">
                                        <Pill className="h-6 w-6 text-indigo-600" />
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Dosage:</span>
                                        <span className="font-medium text-slate-900">{prescription.dosage}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Frequency:</span>
                                        <span className="font-medium text-slate-900">{prescription.frequency}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Start Date:</span>
                                        <span className="font-medium text-slate-900">
                                            {format(new Date(prescription.startDate), 'MMM dd, yyyy')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">End Date:</span>
                                        <span className="font-medium text-slate-900">
                                            {format(new Date(prescription.endDate), 'MMM dd, yyyy')}
                                        </span>
                                    </div>
                                </div>

                                {prescription.notes && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                                        <p className="text-sm text-blue-900">
                                            <strong>Note:</strong> {prescription.notes}
                                        </p>
                                    </div>
                                )}

                                {/* Days Left Progress */}
                                <div className="mt-4">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-slate-600">Days Remaining</span>
                                        <span className={`font-bold ${getUrgencyText(prescription.daysLeft)}`}>
                                            {prescription.daysLeft} days
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-3">
                                        <div
                                            className={`h-3 rounded-full ${getUrgencyColor(prescription.daysLeft)}`}
                                            style={{
                                                width: `${Math.min((prescription.daysLeft / 30) * 100, 100)}%`,
                                            }}
                                        />
                                    </div>
                                    {prescription.daysLeft < 3 && (
                                        <div className="flex items-center space-x-2 mt-3 text-red-600 text-sm">
                                            <AlertCircle className="h-4 w-4" />
                                            <span className="font-medium">
                                                Medication ending soon! Please consult your doctor for refill.
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="card text-center py-12">
                        <Pill className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">No Prescriptions</h3>
                        <p className="text-slate-600">
                            Your active prescriptions will appear here when prescribed by doctors
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PrescriptionsPage;
