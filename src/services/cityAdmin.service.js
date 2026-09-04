import { axiosInstance } from '../api/axiosInstance.js';

export const cityAdminService = {
  getDashboard: () => axiosInstance.get('/city-admin/dashboard'),
  getPartners: () => axiosInstance.get('/city-admin/partners'),
  approvePartner: (id) => axiosInstance.patch(`/city-admin/partners/${id}/approve`),
  rejectPartner: (id, reason) => axiosInstance.patch(`/city-admin/partners/${id}/reject`, { reason }),
  updateDocumentStatus: (id, docKey, status, rejectionReason) => axiosInstance.patch(`/city-admin/partners/${id}/documents/status`, { docKey, status, rejectionReason }),
  verifyPartnerKyc: (id) => axiosInstance.patch(`/city-admin/partners/${id}/kyc-verify`),
  suspendPartner: (id) => axiosInstance.patch(`/city-admin/partners/${id}/suspend`),
  activatePartner: (id) => axiosInstance.patch(`/city-admin/partners/${id}/activate`),
  getBookings: () => axiosInstance.get('/city-admin/bookings'),
  assignBooking: (bookingId, partnerId) => axiosInstance.patch(`/city-admin/bookings/${bookingId}/assign`, { partnerId }),
  cancelBooking: (bookingId, reason) => axiosInstance.patch(`/city-admin/bookings/${bookingId}/cancel`, { reason }),
  getRevenue: () => axiosInstance.get('/city-admin/revenue'),
  getTickets: (params) => axiosInstance.get('/city-admin/tickets', { params }),
  updateTicketStatus: (id, data) => axiosInstance.put(`/city-admin/tickets/${id}`, data),
};
