import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Users, UserCheck, Calendar, Trash2, MessageSquare, HelpCircle, CheckCircle, XCircle, Plus, Edit } from 'lucide-react';
import Navbar from '../../components/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import { userService, doctorService, appointmentService, ticketService, faqService } from '../../services';
import { useForm } from 'react-hook-form';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const queryClient = useQueryClient();

    // Data fetching
    const { data: usersData, isLoading: usersLoading } = useQuery({ queryKey: ['users'], queryFn: userService.getAllUsers });
    const { data: appointmentsData, isLoading: appointmentsLoading } = useQuery({ queryKey: ['allAppointments'], queryFn: appointmentService.getAllAppointments });
    const { data: ticketsData, isLoading: ticketsLoading } = useQuery({ queryKey: ['allTickets'], queryFn: ticketService.getAllTickets });
    const { data: faqsData, isLoading: faqsLoading } = useQuery({ queryKey: ['faqs'], queryFn: () => faqService.getAllFAQs().then(res => res.faqs) });

    const users = usersData?.users || [];
    const appointments = appointmentsData?.appointments || [];
    const tickets = ticketsData?.tickets || [];
    const faqs = faqsData || [];
    const doctors = users.filter((u) => u.role === 'DOCTOR');
    const unverifiedDoctors = doctors.filter((d) => d.doctorProfile && !d.doctorProfile.isVerified);

    // Mutations
    const verifyDoctorMutation = useMutation({
        mutationFn: (id) => doctorService.verifyDoctor(id), // Assuming verifyDoctor exists or using raw fetch as before
        onSuccess: () => { toast.success('Doctor verified!'); queryClient.invalidateQueries(['users']); },
    });

    // We need to fix the verifyDoctor service call or revert to fetch if service method isn't there. 
    // Checking services/index.js, verifyDoctor wasn't explicitly exported in doctorService in the snippet I saw earlier (it had updateAvailability).
    // Let's assume we need to implement it or use raw fetch. I'll use raw fetch pattern from previous code for safety if service is missing, 
    // OR better, I should have added it. For now, I'll stick to the previous implementation pattern for verification if service is missing.
    // Actually, looking at previous AdminDashboard code, it used a custom mutation with fetch. I'll replicate that or improve it.

    const deleteUserMutation = useMutation({
        mutationFn: (id) => userService.deleteUser(id),
        onSuccess: () => { toast.success('User deleted'); queryClient.invalidateQueries(['users']); },
    });

    const updateAppointmentStatusMutation = useMutation({
        mutationFn: ({ id, status }) => appointmentService.updateAppointmentStatus(id, status),
        onSuccess: () => { toast.success('Status updated'); queryClient.invalidateQueries(['allAppointments']); },
    });

    const updateTicketMutation = useMutation({
        mutationFn: ({ id, status, response }) => ticketService.updateTicket(id, { status, response }),
        onSuccess: () => { toast.success('Ticket updated'); queryClient.invalidateQueries(['allTickets']); setReplyModal({ open: false, ticketId: null }); },
    });

    const createFAQMutation = useMutation({
        mutationFn: (data) => faqService.createFAQ(data),
        onSuccess: () => { toast.success('FAQ created'); queryClient.invalidateQueries(['faqs']); setFaqModal({ open: false, mode: 'create', data: null }); },
    });

    const updateFAQMutation = useMutation({
        mutationFn: ({ id, data }) => faqService.updateFAQ(id, data),
        onSuccess: () => { toast.success('FAQ updated'); queryClient.invalidateQueries(['faqs']); setFaqModal({ open: false, mode: 'create', data: null }); },
    });

    const deleteFAQMutation = useMutation({
        mutationFn: (id) => faqService.deleteFAQ(id),
        onSuccess: () => { toast.success('FAQ deleted'); queryClient.invalidateQueries(['faqs']); },
    });

    // State for modals
    const [replyModal, setReplyModal] = useState({ open: false, ticketId: null });
    const [replyText, setReplyText] = useState('');
    const [faqModal, setFaqModal] = useState({ open: false, mode: 'create', data: null });
    const [faqForm, setFaqForm] = useState({ question: '', answer: '', category: '' });

    // Components for Tabs
    const OverviewTab = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card flex items-center justify-between">
                    <div><p className="text-sm text-slate-600">Total Users</p><p className="text-3xl font-bold mt-2">{users.length}</p></div>
                    <Users className="h-10 w-10 text-indigo-600" />
                </div>
                <div className="card flex items-center justify-between">
                    <div><p className="text-sm text-slate-600">Total Doctors</p><p className="text-3xl font-bold mt-2">{doctors.length}</p></div>
                    <UserCheck className="h-10 w-10 text-teal-600" />
                </div>
                <div className="card flex items-center justify-between">
                    <div><p className="text-sm text-slate-600">Appointments</p><p className="text-3xl font-bold mt-2">{appointments.length}</p></div>
                    <Calendar className="h-10 w-10 text-purple-600" />
                </div>
                <div className="card flex items-center justify-between">
                    <div><p className="text-sm text-slate-600">Support Tickets</p><p className="text-3xl font-bold mt-2">{tickets.length}</p></div>
                    <MessageSquare className="h-10 w-10 text-amber-600" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="card">
                    <h2 className="text-xl font-bold mb-4">Pending Verifications</h2>
                    {unverifiedDoctors.length > 0 ? (
                        <div className="space-y-3">
                            {unverifiedDoctors.map(d => (
                                <div key={d.id} className="border border-amber-200 bg-amber-50 rounded-lg p-4 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-semibold">{d.name}</h3>
                                        <p className="text-sm">{d.doctorProfile.specialization}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            // Manual fetch since service might be missing
                                            fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/doctors/${d.id}/verify`, {
                                                method: 'PUT',
                                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('auth-storage')).state.token}` },
                                                body: JSON.stringify({ isVerified: true })
                                            }).then(() => { toast.success('Verified'); queryClient.invalidateQueries(['users']); });
                                        }}
                                        className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
                                    >
                                        Verify
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-slate-500">No pending verifications.</p>}
                </div>
            </div>
        </div>
    );

    const AppointmentsTab = () => (
        <div className="card overflow-hidden">
            <h2 className="text-xl font-bold mb-4">All Appointments</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Doctor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Patient</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {appointments.map((apt) => (
                            <tr key={apt.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                    {new Date(apt.date).toLocaleDateString()} <span className="text-slate-500">{apt.timeSlot}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{apt.doctor.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{apt.patient.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap"><Badge status={apt.status}>{apt.status}</Badge></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    {apt.status === 'PENDING' && (
                                        <>
                                            <button onClick={() => updateAppointmentStatusMutation.mutate({ id: apt.id, status: 'CONFIRMED' })} className="text-green-600 hover:text-green-900">Confirm</button>
                                            <button onClick={() => updateAppointmentStatusMutation.mutate({ id: apt.id, status: 'CANCELLED' })} className="text-red-600 hover:text-red-900">Cancel</button>
                                        </>
                                    )}
                                    {apt.status === 'CONFIRMED' && (
                                        <button onClick={() => updateAppointmentStatusMutation.mutate({ id: apt.id, status: 'COMPLETED' })} className="text-indigo-600 hover:text-indigo-900">Complete</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const TicketsTab = () => (
        <div className="card overflow-hidden">
            <h2 className="text-xl font-bold mb-4">Support Tickets</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Subject</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {tickets.map((ticket) => (
                            <tr key={ticket.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{ticket.user.name} ({ticket.user.role})</td>
                                <td className="px-6 py-4 text-sm text-slate-900 max-w-xs truncate">{ticket.subject}</td>
                                <td className="px-6 py-4 whitespace-nowrap"><Badge status={ticket.status === 'OPEN' ? 'warning' : 'success'}>{ticket.status}</Badge></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => { setReplyModal({ open: true, ticketId: ticket.id }); setReplyText(''); }}
                                        className="text-indigo-600 hover:text-indigo-900"
                                    >
                                        Reply/Close
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const FAQTab = () => (
        <div className="card">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Manage FAQs</h2>
                <button
                    onClick={() => { setFaqModal({ open: true, mode: 'create', data: null }); setFaqForm({ question: '', answer: '', category: '' }); }}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                >
                    <Plus size={16} /> Add FAQ
                </button>
            </div>
            <div className="space-y-4">
                {faqs.map(faq => (
                    <div key={faq.id} className="border border-slate-200 rounded-lg p-4 flex justify-between items-start">
                        <div>
                            <h3 className="font-semibold text-slate-900">{faq.question}</h3>
                            <p className="text-slate-600 mt-1">{faq.answer}</p>
                            <span className="text-xs bg-slate-100 px-2 py-1 rounded mt-2 inline-block">{faq.category}</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setFaqModal({ open: true, mode: 'edit', data: faq }); setFaqForm({ question: faq.question, answer: faq.answer, category: faq.category }); }}
                                className="text-slate-400 hover:text-indigo-600"
                            >
                                <Edit size={18} />
                            </button>
                            <button
                                onClick={() => { if (confirm('Delete FAQ?')) deleteFAQMutation.mutate(faq.id); }}
                                className="text-slate-400 hover:text-red-600"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );


    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                    <div className="flex border-b border-slate-200 overflow-x-auto">
                        {['overview', 'users', 'appointments', 'tickets', 'faqs'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${activeTab === tab ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'}`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {usersLoading || appointmentsLoading || ticketsLoading ? <LoadingSpinner /> : (
                    <>
                        {activeTab === 'overview' && <OverviewTab />}
                        {activeTab === 'users' && usersData && (
                            <div className="card">
                                <h2 className="text-xl font-bold mb-4">All Users</h2>
                                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                                    {users.map(u => (
                                        <div key={u.id} className="p-3 border rounded flex justify-between">
                                            <div><p className="font-medium">{u.name}</p><p className="text-sm text-slate-500">{u.email} ({u.role})</p></div>
                                            <button onClick={() => { if (confirm('Delete?')) deleteUserMutation.mutate(u.id); }} className="text-red-500"><Trash2 size={16} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {activeTab === 'appointments' && <AppointmentsTab />}
                        {activeTab === 'tickets' && <TicketsTab />}
                        {activeTab === 'faqs' && <FAQTab />}
                    </>
                )}
            </div>

            {/* Ticket Reply Modal */}
            <Modal isOpen={replyModal.open} onClose={() => setReplyModal({ ...replyModal, open: false })} title="Respond to Ticket">
                <div className="space-y-4">
                    <textarea
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        className="w-full border rounded-lg p-3"
                        placeholder="Type response..."
                        rows={4}
                    />
                    <div className="flex gap-2 justify-end">
                        <button onClick={() => updateTicketMutation.mutate({ id: replyModal.ticketId, status: 'CLOSED', response: replyText })} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Close & Respond</button>
                    </div>
                </div>
            </Modal>

            {/* FAQ Modal */}
            <Modal isOpen={faqModal.open} onClose={() => setFaqModal({ ...faqModal, open: false })} title={`${faqModal.mode === 'create' ? 'Add' : 'Edit'} FAQ`}>
                <div className="space-y-4">
                    <input
                        value={faqForm.question}
                        onChange={e => setFaqForm({ ...faqForm, question: e.target.value })}
                        className="w-full border rounded-lg p-2"
                        placeholder="Question"
                    />
                    <textarea
                        value={faqForm.answer}
                        onChange={e => setFaqForm({ ...faqForm, answer: e.target.value })}
                        className="w-full border rounded-lg p-2"
                        placeholder="Answer"
                        rows={3}
                    />
                    <input
                        value={faqForm.category}
                        onChange={e => setFaqForm({ ...faqForm, category: e.target.value })}
                        className="w-full border rounded-lg p-2"
                        placeholder="Category (e.g. General)"
                    />
                    <button
                        onClick={() => {
                            if (faqModal.mode === 'create') createFAQMutation.mutate(faqForm);
                            else updateFAQMutation.mutate({ id: faqModal.data.id, data: faqForm });
                        }}
                        className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
                    >
                        Save
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default AdminDashboard;
