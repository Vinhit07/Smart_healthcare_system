import { useQuery } from '@tanstack/react-query';
import { Pill, AlertCircle, Download } from 'lucide-react';
import { format } from 'date-fns';
import Navbar from '../../components/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { prescriptionService } from '../../services';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const PrescriptionsPage = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['prescriptions'],
        queryFn: prescriptionService.getMyPrescriptions,
    });

    const prescriptions = data?.prescriptions || [];

    const generateAllPrescriptionsPDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(79, 70, 229); // indigo-600
        doc.text('Smart Healthcare', 105, 20, { align: 'center' });

        doc.setFontSize(14);
        doc.setTextColor(100, 100, 100);
        doc.text('Comprehensive Medication History', 105, 30, { align: 'center' });

        // Patient Info
        const patientName = prescriptions[0]?.patient?.name || 'Patient';
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(`Patient: ${patientName}`, 14, 45);
        doc.text(`Generated: ${format(new Date(), 'MMM dd, yyyy')}`, 14, 52);

        // Table Data
        const tableBody = prescriptions.map(p => [
            p.medicationName,
            `Dr. ${p.doctor.name} (${p.doctor.doctorProfile?.specialization || 'General'})`,
            `${p.dosage}\n${p.frequency}`,
            `${format(new Date(p.startDate), 'MMM dd, yyyy')}\nto\n${format(new Date(p.endDate), 'MMM dd, yyyy')}`,
            p.status === 'ACTIVE' ? 'Active' : 'Completed'
        ]);

        autoTable(doc, {
            startY: 60,
            head: [['Medication', 'Prescribed By', 'Dosage & Freq', 'Duration', 'Status']],
            body: tableBody,
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229], textColor: 255 },
            styles: { fontSize: 9, cellPadding: 3 },
            columnStyles: {
                0: { fontStyle: 'bold' },
                2: { cellWidth: 35 },
                3: { cellWidth: 35 }
            }
        });

        doc.save(`medication_history_${patientName.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    };

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

    const generatePrescriptionPDF = (prescription) => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.setTextColor(79, 70, 229); // indigo-600
        doc.text('Smart Healthcare', 105, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Medical Prescription', 105, 28, { align: 'center' });

        // Line separator
        doc.setDrawColor(200, 200, 200);
        doc.line(20, 35, 190, 35);

        // Doctor Information
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text('Prescribed by:', 20, 45);
        doc.setFontSize(10);
        doc.text(`Dr. ${prescription.doctor.name}`, 20, 52);
        doc.text(`${prescription.doctor.doctorProfile?.specialization || 'General Practice'}`, 20, 58);

        // Date
        doc.text(`Date: ${format(new Date(prescription.createdAt || prescription.startDate), 'MMM dd, yyyy')}`, 20, 70);

        // Patient Information (if available)
        doc.setFontSize(12);
        doc.text('Patient:', 120, 45);
        doc.setFontSize(10);
        doc.text(`${prescription.patient?.name || 'Patient'}`, 120, 52);

        // Line separator
        doc.line(20, 78, 190, 78);

        // Prescription Details
        doc.setFontSize(14);
        doc.setTextColor(79, 70, 229);
        doc.text('Rx', 20, 90);

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Medication: ${prescription.medicationName}`, 20, 100);

        doc.setFontSize(10);
        doc.text(`Dosage: ${prescription.dosage}`, 20, 108);
        doc.text(`Frequency: ${prescription.frequency}`, 20, 116);
        doc.text(`Duration: ${format(new Date(prescription.startDate), 'MMM dd, yyyy')} to ${format(new Date(prescription.endDate), 'MMM dd, yyyy')}`, 20, 124);

        if (prescription.notes) {
            doc.setFontSize(11);
            doc.text('Instructions:', 20, 135);
            doc.setFontSize(9);
            const splitNotes = doc.splitTextToSize(prescription.notes, 170);
            doc.text(splitNotes, 20, 142);
        }

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('This is a digitally generated prescription. Please show this at the pharmacy.', 105, 280, { align: 'center' });

        // Save
        doc.save(`prescription-${prescription.medicationName.replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">My Prescriptions</h1>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                            <Pill className="h-5 w-5" />
                            <span>{prescriptions.length} total prescriptions</span>
                        </div>
                        {prescriptions.length > 0 && (
                            <button
                                onClick={generateAllPrescriptionsPDF}
                                className="flex items-center space-x-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
                            >
                                <Download size={16} />
                                <span>Download History</span>
                            </button>
                        )}
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

                                {/* Download PDF Button */}
                                <button
                                    onClick={() => generatePrescriptionPDF(prescription)}
                                    className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
                                >
                                    <Download size={18} />
                                    Download PDF
                                </button>
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
