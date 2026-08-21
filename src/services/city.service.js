import { axiosInstance } from '../api/axiosInstance.js';

export const cityService = {
  // Public/Onboarding Active Cities
  getActiveCities: () => axiosInstance.get('/cities/active'),

  // Super Admin Management
  getAllCities: (params) => axiosInstance.get('/super-admin/cities', { params }),
  createCity: (data) => axiosInstance.post('/super-admin/cities', data),
  updateCity: (id, data) => axiosInstance.put(`/super-admin/cities/${id}`, data),
  toggleCityStatus: (id) => axiosInstance.patch(`/super-admin/cities/${id}/status`),
  deleteCity: (id) => axiosInstance.delete(`/super-admin/cities/${id}`),
};
