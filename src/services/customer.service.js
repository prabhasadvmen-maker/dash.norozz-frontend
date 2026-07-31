import { axiosInstance } from '../api/axiosInstance.js';

export const customerService = {
  getDashboard: () => axiosInstance.get('/customer/dashboard'),
  getCategories: () => axiosInstance.get('/customer/categories'),
  getPopularServices: () => axiosInstance.get('/customer/services/popular'),
  getFeaturedServices: () => axiosInstance.get('/customer/services/featured'),
  getOffers: () => axiosInstance.get('/customer/offers'),
  getWallet: () => axiosInstance.get('/customer/wallet'),
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
};
