import api from './client';

export const comparisonApi = {
  compareVehicles: async (vehicleIds) => {
    const response = await api.post('/vehicle-comparison', { vehicleIds });
    return response.data;
  },
};

export default comparisonApi;
