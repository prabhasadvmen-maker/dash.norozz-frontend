import { axiosInstance } from '../api/axiosInstance.js';

export const superAdminService = {
  getDashboard: () => axiosInstance.get('/super-admin/dashboard'),
  getCityAdmins: () => axiosInstance.get('/super-admin/city-admins'),
  createCityAdmin: (data) => axiosInstance.post('/super-admin/city-admins', data),
  updateCityAdmin: (id, data) => axiosInstance.put(`/super-admin/city-admins/${id}`, data),
  deleteCityAdmin: (id) => axiosInstance.delete(`/super-admin/city-admins/${id}`),
  updateCityAdminStatus: (id, status) => axiosInstance.patch(`/super-admin/city-admins/${id}/status`, { status }),
  getCustomers: () => axiosInstance.get('/super-admin/customers'),
  getPartners: () => axiosInstance.get('/super-admin/partners'),
  getBookings: () => axiosInstance.get('/super-admin/bookings'),
};
