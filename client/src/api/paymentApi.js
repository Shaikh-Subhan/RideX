import api from './client';

export const paymentApi = {
  createPayment: async (paymentData) => {
    const response = await api.post('/payments', paymentData);
    return response.data;
  },

  processDemoPayment: async (id, data = {}) => {
    const response = await api.post(`/payments/${id}/pay`, data);
    return response.data;
  },

  getMyPayments: async () => {
    const response = await api.get('/payments/my-payments');
    return response.data;
  },

  getPaymentByBooking: async (bookingId) => {
    const response = await api.get(`/payments/booking/${bookingId}`);
    return response.data;
  },

  processDemoRefund: async (id, data = {}) => {
    const response = await api.post(`/payments/${id}/refund`, data);
    return response.data;
  },
};

export default paymentApi;
