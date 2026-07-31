import { axiosInstance } from '../api/axiosInstance.js';

export const bookingService = {
  createBooking: (data) => axiosInstance.post('/bookings', data),
  payBooking: (id, paymentMethod = 'UPI') => axiosInstance.post(`/bookings/${id}/pay`, { paymentMethod }),
  assignPartner: (id, partnerId) => axiosInstance.patch(`/bookings/${id}/assign`, { partnerId }),
  acceptBooking: (id) => axiosInstance.patch(`/bookings/${id}/accept`),
  onTheWayBooking: (id) => axiosInstance.patch(`/bookings/${id}/on-the-way`),
  startBooking: (id) => axiosInstance.patch(`/bookings/${id}/start`),
  completeBooking: (id) => axiosInstance.patch(`/bookings/${id}/complete`),
  rateBooking: (id, data) => axiosInstance.post(`/bookings/${id}/rate`, data),
  cancelBooking: (id, reason) => axiosInstance.patch(`/bookings/${id}/cancel`, { reason }),
  getMyBookings: () => axiosInstance.get('/bookings/my-bookings'),
  getBookingById: (id) => axiosInstance.get(`/bookings/${id}`),

  // Dispatch Auto Assignment
  autoAssign: (bookingId) => axiosInstance.post(`/dispatch/auto-assign/${bookingId}`),
};
