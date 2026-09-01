import { axiosInstance } from '../api/axiosInstance.js';

export const customerService = {
  getDashboard: () => axiosInstance.get('/customer/dashboard'),
  getCategories: () => axiosInstance.get('/customer/categories'),
  getPopularServices: () => axiosInstance.get('/customer/services/popular'),
  getFeaturedServices: () => axiosInstance.get('/customer/services/featured'),
  getOffers: () => axiosInstance.get('/customer/offers'),
  getWallet: () => axiosInstance.get('/customer/wallet'),
  addWalletMoney: (data) => axiosInstance.post('/customer/wallet/add-money', data),
  getNotifications: () => axiosInstance.get('/customer/notifications'),
  getReviews: () => axiosInstance.get('/customer/reviews'),
  getFavorites: () => axiosInstance.get('/customer/favorites'),
  toggleFavorite: (serviceName) => axiosInstance.post('/customer/favorites', { serviceName }),
  getBookingHistory: () => axiosInstance.get('/customer/bookings/history'),
  getUpcomingBookings: () => axiosInstance.get('/customer/bookings/upcoming'),
  getCompletedBookings: () => axiosInstance.get('/customer/bookings/completed'),
  getCancelledBookings: () => axiosInstance.get('/customer/bookings/cancelled'),

  // Profile & Address CRUD
  getProfile: () => axiosInstance.get('/customer/auth/profile'),
  updateProfile: (data) => axiosInstance.put('/customer/auth/profile', data),
  getAddresses: () => axiosInstance.get('/customer/auth/addresses'),
  addAddress: (data) => axiosInstance.post('/customer/auth/addresses', data),
  updateAddress: (id, data) => axiosInstance.put(`/customer/auth/addresses/${id}`, data),
  deleteAddress: (id) => axiosInstance.delete(`/customer/auth/addresses/${id}`),

  // Referral System API
  getReferralData: () => axiosInstance.get('/customer/referral'),
  sendReferralInvite: (data) => axiosInstance.post('/customer/referral/invite', data),

  // Coupon Validation & Application API
  applyCoupon: (data) => axiosInstance.post('/customer/coupons/apply', data),
  getSystemSettings: () => axiosInstance.get('/customer/system-settings'),
};
