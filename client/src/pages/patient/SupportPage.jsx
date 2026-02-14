import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ticketService } from '../../services';
import Navbar from '../../components/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import { MessageSquare, Plus, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ticketSchema = z.object({
    subject: z.string().min(5, 'Subject must be at least 5 characters'),
    message: z.string().min(10, 'Message must be at least 10 characters'),
});

const SupportPage = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: tickets, isLoading } = useQuery({
        queryKey: ['myTickets'],
        queryFn: () => ticketService.getMyTickets().then(res => res.tickets),
    });

    const createMutation = useMutation({
        mutationFn: ticketService.createTicket,
        onSuccess: () => {
            queryClient.invalidateQueries(['myTickets']);
            setIsModalOpen(false);
            toast.success('Ticket created successfully');
            reset();
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Failed to create ticket');
        },
    });

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(ticketSchema),
    });

    const onSubmit = (data) => {
        createMutation.mutate(data);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'OPEN': return 'warning';
            case 'IN_PROGRESS': return 'info';
            case 'CLOSED': return 'success';
            default: return 'default';
        }
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Support Tickets</h1>
                        <p className="text-slate-600">Track and manage your support requests</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Raise Ticket
                    </button>
                </div>

                <div className="grid gap-6">
                    {tickets?.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 shadow-sm">
                            <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-900">No tickets yet</h3>
                            <p className="text-slate-500 mt-2">Need help? Create a new support ticket.</p>
                        </div>
                    )}
                    {tickets?.map((ticket) => (
                        <div key={ticket.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900">{ticket.subject}</h3>
                                    <p className="text-sm text-slate-500">Created on {new Date(ticket.createdAt).toLocaleDateString()}</p>
                                </div>
                                <Badge variant={getStatusColor(ticket.status)}>{ticket.status.replace('_', ' ')}</Badge>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-lg mb-4">
                                <p className="text-slate-700">{ticket.message}</p>
                            </div>
                            {ticket.response && (
                                <div className="bg-green-50 border border-green-100 p-4 rounded-lg">
                                    <h4 className="text-sm font-semibold text-green-900 mb-1 flex items-center gap-2">
                                        <CheckCircle size={16} /> Admin Response
                                    </h4>
                                    <p className="text-green-800">{ticket.response}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Raise Support Ticket">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                        <input
                            {...register('subject')}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Brief summary of issue"
                        />
                        {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                        <textarea
                            {...register('message')}
                            rows={4}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Describe your issue in detail..."
                        />
                        {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {createMutation.isPending ? 'Submitting...' : 'Submit Ticket'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default SupportPage;
