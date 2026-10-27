import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Public (no-login) endpoints: plain axios so portal token / 401 refresh logic never interferes.
const http = axios.create({ baseURL: `${API_BASE_URL}/partner-hiring`, timeout: 60000 });

const unwrap = (res) => res.data?.data ?? res.data;

export const errorMessage = (err, fallback = 'Something went wrong. Please try again.') => {
  const data = err?.response?.data;
  return data?.errors?.[0]?.message || data?.message || err?.message || fallback;
};

export const partnerHiringService = {
  sendOtp: (channel, value) => http.post('/otp/send', { channel, value }).then(unwrap),
  verifyOtp: (channel, value, otp) => http.post('/otp/verify', { channel, value, otp }).then(unwrap),
  submitApplication: (formData) => http.post('/applications', formData).then(unwrap),
  verifyPayment: (applicationId, payload) =>
    http.post(`/applications/${applicationId}/verify-payment`, payload).then(unwrap),
};
