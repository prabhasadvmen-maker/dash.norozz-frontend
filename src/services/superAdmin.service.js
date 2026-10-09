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

  // Platform & Referral Settings
  getSettings: () => axiosInstance.get('/super-admin/referral-settings'),
  updateSettings: (data) => axiosInstance.put('/super-admin/referral-settings', data),
  getAllReferrals: () => axiosInstance.get('/super-admin/referrals'),

  // Banner Management CRUD
  getBanners: () => axiosInstance.get('/super-admin/banners'),
  createBanner: (data) => axiosInstance.post('/super-admin/banners', data),
  updateBanner: (id, data) => axiosInstance.put(`/super-admin/banners/${id}`, data),
  deleteBanner: (id) => axiosInstance.delete(`/super-admin/banners/${id}`),
  toggleBannerStatus: (id) => axiosInstance.patch(`/super-admin/banners/${id}/status`),
  getPresignedUrl: (data) => axiosInstance.post('/media/presigned-url', data),

  // FAQ Management CRUD
  getFaqs: (params) => axiosInstance.get('/super-admin/faqs', { params }),
  createFaq: (data) => axiosInstance.post('/super-admin/faqs', data),
  updateFaq: (id, data) => axiosInstance.put(`/super-admin/faqs/${id}`, data),
  deleteFaq: (id) => axiosInstance.delete(`/super-admin/faqs/${id}`),
  toggleFaqStatus: (id) => axiosInstance.patch(`/super-admin/faqs/${id}/status`),

  // Support Tickets Management CRUD
  getTickets: (params) => axiosInstance.get('/super-admin/tickets', { params }),
  updateTicketStatus: (id, data) => axiosInstance.put(`/super-admin/tickets/${id}`, data),
  deleteTicket: (id) => axiosInstance.delete(`/super-admin/tickets/${id}`),

  // Legal Policies Management CRUD
  getAllPolicies: () => axiosInstance.get('/super-admin/policies'),
  getPolicy: (targetApp, type) => axiosInstance.get(`/super-admin/policies/${targetApp}/${type}`),
  savePolicy: (targetApp, type, data) => axiosInstance.post(`/super-admin/policies/${targetApp}/${type}`, data),

  // Starter Pack Management (New User Offers)
  getStarterPack: () => axiosInstance.get('/super-admin/starter-pack'),
  updateStarterPack: (data) => axiosInstance.put('/super-admin/starter-pack', data),
};
