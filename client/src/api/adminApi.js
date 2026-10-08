import api from "./client";

export const adminApi = {
  getDashboardStats: async () => {
    const response = await api.get("/admin/dashboard");
    return response.data;
  },

  getAllUsers: async (params = {}) => {
    const response = await api.get("/admin/users", {params});
    return response.data;
  },

  getAllVehiclesAdmin: async (params = {}) => {
    const response = await api.get("/admin/vehicles", {params});
    return response.data;
  },

  getAllBookingsAdmin: async (params = {}) => {
    const response = await api.get("/admin/bookings", {params});
    return response.data;
  },

  getAllPaymentsAdmin: async (params = {}) => {
    const response = await api.get("/admin/payments", {params});
    return response.data;
  },

  getPendingVerifications: async () => {
    const response = await api.get("/admin/vehicles/pending-verifications");
    return response.data;
  },

  getVehicleVerificationDocument: async (id, document) => {
    const response = await api.get(
      `/admin/vehicles/${id}/verification/${document}`,
    );
    return response.data;
  },

  reviewVehicleVerification: async (id, status) => {
    const response = await api.put(`/admin/vehicles/${id}/verification`, {
      status,
    });
    return response.data;
  },
};

export default adminApi;
