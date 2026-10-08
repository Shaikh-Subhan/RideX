import api from './client';

export const reviewApi = {
  createVehicleReview: async (reviewData) => {
    const response = await api.post('/vehicle-reviews', reviewData);
    return response.data;
  },

  getVehicleReviews: async (vehicleId) => {
    const response = await api.get(`/vehicle-reviews/vehicle/${vehicleId}`);
    return response.data;
  },
};

export default reviewApi;
