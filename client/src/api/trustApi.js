import api from './client';

export const trustApi = {
  createRenterTrustReview: async (trustData) => {
    const response = await api.post('/renter-trust', trustData);
    return response.data;
  },

  getRenterTrustReviews: async (renterId) => {
    const response = await api.get(`/renter-trust/renter/${renterId}`);
    return response.data;
  },
};

export default trustApi;
