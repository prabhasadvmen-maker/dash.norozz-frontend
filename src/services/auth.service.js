import { axiosInstance } from '../api/axiosInstance.js';

export const authService = {
  // Customer Auth
  customerSignup: (data) => axiosInstance.post('/customer/auth/signup', data),
  customerLogin: (data) => axiosInstance.post('/customer/auth/login', data),
  requestOtpLogin: (data) => axiosInstance.post('/customer/auth/otp-login/request', data),
  verifyOtpLogin: (data) => axiosInstance.post('/customer/auth/otp-login/verify', data),
  forgotPassword: (data) => axiosInstance.post('/customer/auth/forgot-password', data),
  resetPassword: (data) => axiosInstance.post('/customer/auth/reset-password', data),
  updateCustomerProfile: (data, config = {}) => axiosInstance.put('/customer/auth/profile', data, config),
  sendSecondaryOtp: (data, config = {}) => axiosInstance.post('/customer/auth/secondary-otp/send', data, config),
  verifySecondaryOtp: (data, config = {}) => axiosInstance.post('/customer/auth/secondary-otp/verify', data, config),
  customerLogout: () => axiosInstance.post('/customer/auth/logout'),

  // Partner Auth
  partnerSignup: (data) => axiosInstance.post('/partner/auth/signup', data),
  partnerLogin: (data) => axiosInstance.post('/partner/auth/login', data),
  requestPartnerOtpLogin: (data) => axiosInstance.post('/partner/auth/otp/request', data),
  verifyPartnerOtpLogin: (data) => axiosInstance.post('/partner/auth/otp/verify', data),
  updatePartnerProfile: (data, config = {}) => axiosInstance.put('/partner/auth/profile', data, config),
  submitPartnerKyc: (data, config = {}) => axiosInstance.post('/partner/auth/kyc-submit', data, config),
  saveOnboardingDocuments: (data, config = {}) => axiosInstance.post('/partner/auth/onboarding/documents', data, config),
  saveOnboardingCategory: (data, config = {}) => axiosInstance.post('/partner/auth/onboarding/category', data, config),
  saveOnboardingSkills: (data, config = {}) => axiosInstance.post('/partner/auth/onboarding/skills', data, config),
  saveOnboardingServiceArea: (data, config = {}) => axiosInstance.post('/partner/auth/onboarding/service-area', data, config),
  saveOnboardingWorkingHours: (data, config = {}) => axiosInstance.post('/partner/auth/onboarding/working-hours', data, config),
  partnerLogout: () => axiosInstance.post('/partner/auth/logout'),
  getKycStatus: () => axiosInstance.get('/partner/auth/kyc-status'),

  // Admin Auth
  cityAdminLogin: (data) => axiosInstance.post('/auth/admin/login', data),
  superAdminLogin: (data) => axiosInstance.post('/auth/super-admin/login', data),
};
