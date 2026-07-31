import { axiosInstance } from '../api/axiosInstance.js';

export const authService = {
  // Customer Auth
  customerSignup: (data) => axiosInstance.post('/customer/auth/signup', data),
  customerLogin: (data) => axiosInstance.post('/customer/auth/login', data),
  requestOtpLogin: (data) => axiosInstance.post('/customer/auth/otp-login/request', data),
  verifyOtpLogin: (data) => axiosInstance.post('/customer/auth/otp-login/verify', data),
  forgotPassword: (data) => axiosInstance.post('/customer/auth/forgot-password', data),
  resetPassword: (data) => axiosInstance.post('/customer/auth/reset-password', data),
  customerLogout: () => axiosInstance.post('/customer/auth/logout'),

  // Partner Auth
  partnerSignup: (data) => axiosInstance.post('/partner/auth/signup', data),
  partnerLogin: (data) => axiosInstance.post('/partner/auth/login', data),
  partnerLogout: () => axiosInstance.post('/partner/auth/logout'),
  getKycStatus: () => axiosInstance.get('/partner/auth/kyc-status'),

  // Admin Auth
  cityAdminLogin: (data) => axiosInstance.post('/auth/admin/login', data),
  superAdminLogin: (data) => axiosInstance.post('/auth/super-admin/login', data),
};
