import api from './api';

const analyticsService = {
    getAnalytics: () => api.get('/analytics').then(res => res.data)
};

export default analyticsService;
