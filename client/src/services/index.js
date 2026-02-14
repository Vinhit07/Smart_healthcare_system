import api from './api';

export const authService = {
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },

    getMe: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },
};

export const doctorService = {
    getAllDoctors: async (filters = {}) => {
        const params = new URLSearchParams(filters);
        const response = await api.get(`/doctors?${params}`);
        return response.data;
    },

    getDoctorById: async (id) => {
        const response = await api.get(`/doctors/${id}`);
        return response.data;
    },

    updateAvailability: async (availableSlots) => {
        const response = await api.put('/doctors/availability', { availableSlots });
        return response.data;
    },
};

export const appointmentService = {
    createAppointment: async (appointmentData) => {
        const response = await api.post('/appointments', appointmentData);
        return response.data;
    },

    getMyAppointments: async () => {
        const response = await api.get('/appointments/my');
        return response.data;
    },

    updateAppointmentStatus: async (id, status) => {
        const response = await api.put(`/appointments/${id}/status`, { status });
        return response.data;
    },

    getAllAppointments: async () => {
        const response = await api.get('/appointments');
        return response.data;
    },
};

export const prescriptionService = {
    createPrescription: async (prescriptionData) => {
        const response = await api.post('/prescriptions', prescriptionData);
        return response.data;
    },

    getMyPrescriptions: async () => {
        const response = await api.get('/prescriptions/my');
        return response.data;
    },

    updatePrescription: async (id, prescriptionData) => {
        const response = await api.put(`/prescriptions/${id}`, prescriptionData);
        return response.data;
    },

    deletePrescription: async (id) => {
        const response = await api.delete(`/prescriptions/${id}`);
        return response.data;
    },
};

export const aiService = {
    predictDisease: async (symptoms) => {
        const response = await api.post('/ai/predict-disease', { symptoms });
        return response.data;
    },

    chat: async (message, sessionId) => {
        const response = await api.post('/ai/chat', { message, sessionId });
        return response.data;
    },

    analyze: async (text) => {
        const response = await api.post('/ai/analyze', { text });
        return response.data;
    },

    getHistory: async () => {
        const response = await api.get('/ai/history');
        return response.data;
    },

    getChatSession: async (sessionId) => {
        const response = await api.get(`/ai/chat/${sessionId}`);
        return response.data;
    },
};

export const userService = {
    getProfile: async () => {
        const response = await api.get('/users/profile');
        return response.data;
    },

    updateProfile: async (profileData) => {
        const response = await api.put('/users/profile', profileData);
        return response.data;
    },

    getAllUsers: async () => {
        const response = await api.get('/users/all');
        return response.data;
    },

    deleteUser: async (id) => {
        const response = await api.delete(`/users/${id}`);
        return response.data;
    },
};

export const ticketService = {
    createTicket: async (ticketData) => {
        const response = await api.post('/tickets', ticketData);
        return response.data;
    },
    getMyTickets: async () => {
        const response = await api.get('/tickets/my');
        return response.data;
    },
    getAllTickets: async () => {
        const response = await api.get('/tickets');
        return response.data;
    },
    updateTicket: async (id, data) => {
        const response = await api.put(`/tickets/${id}`, data);
        return response.data;
    },
};

export const faqService = {
    getAllFAQs: async () => {
        const response = await api.get('/faqs');
        return response.data;
    },
    createFAQ: async (faqData) => {
        const response = await api.post('/faqs', faqData);
        return response.data;
    },
    updateFAQ: async (id, faqData) => {
        const response = await api.put(`/faqs/${id}`, faqData);
        return response.data;
    },
    deleteFAQ: async (id) => {
        const response = await api.delete(`/faqs/${id}`);
        return response.data;
    },
};
