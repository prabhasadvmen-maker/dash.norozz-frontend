import { axiosInstance } from '../api/axiosInstance.js';

export const paymentService = {
  createOrder: (data) => axiosInstance.post('/payments/create-order', data),
  verifyPayment: (data) => axiosInstance.post('/payments/verify', data),
  walletPay: (data) => axiosInstance.post('/payments/wallet-pay', data),
  refund: (id, reason) => axiosInstance.post(`/payments/${id}/refund`, { reason }),
  getHistory: (type) => axiosInstance.get('/payments/history', { params: { type } }),
  getInvoice: (id) => axiosInstance.get(`/payments/${id}/invoice`),
};
