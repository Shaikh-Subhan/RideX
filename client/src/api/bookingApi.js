import api from './client';

export const bookingApi = {
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  getMyBookings: async () => {
    const response = await api.get('/bookings/my-bookings');
    return response.data;
  },

  getOwnerBookings: async () => {
    const response = await api.get('/bookings/owner-bookings');
    return response.data;
  },

  getBookingById: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  reviewBooking: async (id, status) => {
    const response = await api.put(`/bookings/${id}/review`, { status });
    return response.data;
  },

  cancelBooking: async (id) => {
    const response = await api.put(`/bookings/${id}/cancel`);
    return response.data;
  },

  completeBooking: async (id) => {
    const response = await api.put(`/bookings/${id}/complete`);
    return response.data;
  },

  getOwnerEarnings: async () => {
    const response = await api.get('/bookings/owner-earnings');
    return response.data;
  },
};

export default bookingApi;
