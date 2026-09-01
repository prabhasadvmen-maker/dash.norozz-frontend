import { axiosInstance } from '../api/axiosInstance.js';

export const kycService = {
  // Mobile OTP
  sendMobileOtp: () => axiosInstance.post('/kyc/otp/send'),
  verifyMobileOtp: (phone) => axiosInstance.post('/kyc/otp/verify', { phone }),

  // PAN Verification
  verifyPan: (panNumber) => axiosInstance.post('/kyc/pan/verify', { panNumber }),

  // DigiLocker
  initDigiLocker: (data = {}) => axiosInstance.post('/kyc/digilocker/init', data),
  fetchDigiLockerStatus: (requestId) => axiosInstance.post('/kyc/digilocker/fetch', { requestId }),

  // Driving Licence
  verifyDrivingLicense: (dlNumber, dob) => axiosInstance.post('/kyc/driving-license/verify', { dlNumber, dob }),

  // Bank Account Verification
  verifyBankAccount: (data) => axiosInstance.post('/kyc/bank-account/verify', data),

  // Face Match & Liveness
  verifyFaceMatch: (data = {}) => axiosInstance.post('/kyc/face-match', data),
  verifyFaceLiveness: (data = {}) => axiosInstance.post('/kyc/face-liveness', data),

  // Get Partner KYC Status
  getKycStatus: (partnerId) => axiosInstance.get(`/kyc/status/${partnerId || ''}`),

  // Admin Partner KYC Details & Actions
  getAdminPartnerKyc: (partnerId) => axiosInstance.get(`/kyc/admin/partners/${partnerId}`),
  approvePartnerAdmin: (partnerId, data = {}) => axiosInstance.post(`/kyc/admin/partners/${partnerId}/approve`, data),
  rejectPartnerAdmin: (partnerId, data = {}) => axiosInstance.post(`/kyc/admin/partners/${partnerId}/reject`, data),
};
