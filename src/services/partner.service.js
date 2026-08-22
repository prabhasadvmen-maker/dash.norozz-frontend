import { axiosInstance } from '../api/axiosInstance.js';

export const partnerService = {
  getDashboard: () => axiosInstance.get('/partner/dashboard'),
  getTodayBookings: () => axiosInstance.get('/partner/bookings/today'),
  getPendingBookings: () => axiosInstance.get('/partner/bookings/pending'),
  getCompletedBookings: () => axiosInstance.get('/partner/bookings/completed'),
  getCancelledBookings: () => axiosInstance.get('/partner/bookings/cancelled'),
  getAllBookings: () => axiosInstance.get('/partner/bookings/all'),
  getBookingDetails: (id) => axiosInstance.get(`/partner/bookings/${id}`),
  getWallet: () => axiosInstance.get('/partner/wallet'),
  getEarnings: () => axiosInstance.get('/partner/earnings'),
  getRating: () => axiosInstance.get('/partner/rating'),
  getProfile: () => axiosInstance.get('/partner/profile'),
  updateProfile: (data) => axiosInstance.put('/partner/profile', data),
  updateAvailability: (data) => axiosInstance.put('/partner/availability', data),
  getNotifications: () => axiosInstance.get('/partner/notifications'),
  getReviews: () => axiosInstance.get('/partner/reviews'),
  uploadDocuments: (formData) => axiosInstance.post('/partner/auth/upload-documents', formData),
};
