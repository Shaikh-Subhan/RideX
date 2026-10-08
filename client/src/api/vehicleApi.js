import api from "./client";

export const vehicleApi = {
  getAllVehicles: async (params = {}) => {
    const cleanParams = {};

    Object.keys(params).forEach((key) => {
      if (
        params[key] !== "" &&
        params[key] !== null &&
        params[key] !== undefined
      ) {
        cleanParams[key] = params[key];
      }
    });

    const response = await api.get("/vehicles", {
      params: cleanParams,
    });

    return response.data;
  },

  getVehicleById: async (id) => {
    const response = await api.get(`/vehicles/${id}`);
    return response.data;
  },

  getMyVehicles: async () => {
    const response = await api.get("/vehicles/my-vehicles");
    return response.data;
  },

  addVehicle: async (vehicleData) => {
    const response = await api.post("/vehicles", vehicleData);
    return response.data;
  },

  updateVehicle: async (id, vehicleData) => {
    const response = await api.put(`/vehicles/${id}`, vehicleData);
    return response.data;
  },

  deleteVehicle: async (id) => {
    const response = await api.delete(`/vehicles/${id}`);
    return response.data;
  },

  updateAvailability: async (id, availability) => {
    const response = await api.put(`/vehicles/${id}/availability`, {
      availability,
    });

    return response.data;
  },

  submitVerification: async (id, documents) => {
    const response = await api.put(`/vehicles/${id}/verification`, documents);

    return response.data;
  },
};

export default vehicleApi;
