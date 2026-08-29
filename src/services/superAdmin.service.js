import { axiosInstance } from '../api/axiosInstance.js';

export const superAdminService = {
  getDashboard: () => axiosInstance.get('/super-admin/dashboard'),
  getCityAdmins: () => axiosInstance.get('/super-admin/city-admins'),
  createCityAdmin: (data) => axiosInstance.post('/super-admin/city-admins', data),
  updateCityAdmin: (id, data) => axiosInstance.put(`/super-admin/city-admins/${id}`, data),
  deleteCityAdmin: (id) => axiosInstance.delete(`/super-admin/city-admins/${id}`),
  updateCityAdminStatus: (id, status) => axiosInstance.patch(`/super-admin/city-admins/${id}/status`, { status }),
  impersonateCityAdmin: (id) => axiosInstance.post(`/super-admin/city-admins/${id}/impersonate`),
  getCustomers: () => axiosInstance.get('/super-admin/customers'),
  getPartners: () => axiosInstance.get('/super-admin/partners'),
  getBookings: () => axiosInstance.get('/super-admin/bookings'),

  // Coupon Management CRUD
  getCoupons: () => axiosInstance.get('/super-admin/coupons'),
  createCoupon: (data) => axiosInstance.post('/super-admin/coupons', data),
  updateCoupon: (id, data) => axiosInstance.put(`/super-admin/coupons/${id}`, data),
  deleteCoupon: (id) => axiosInstance.delete(`/super-admin/coupons/${id}`),
};
