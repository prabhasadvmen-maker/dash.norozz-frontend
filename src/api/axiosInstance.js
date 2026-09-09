import axios from 'axios';
import { toast } from '../utils/toast.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor: Auto-attach JWT Access Token if available
 */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('norozz_token') || localStorage.getItem('norozz_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Auto-remove default 'application/json' Content-Type for FormData payloads
    // so Axios/Browser can automatically generate 'multipart/form-data; boundary=...'
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor: Global Error Handler & Auto Refresh / 401 Redirect
 */
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';

    // Auto Refresh Token on 401 Unauthorized (if not retried yet)
    if (status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/login') && !originalRequest.url?.includes('/auth/customer/login') && !originalRequest.url?.includes('/super-admin/')) {
      originalRequest._retry = true;
      try {
        const refreshRes = await axios.post(
          `${API_BASE_URL}/customer/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        if (refreshRes.data?.data?.accessToken) {
          const newToken = refreshRes.data.data.accessToken;
          localStorage.setItem('norozz_token', newToken);
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        }
      } catch {
        // Refresh token failed -> Clear session & auto logout
        localStorage.removeItem('norozz_token');
        localStorage.removeItem('norozz_user');
        window.dispatchEvent(new Event('norozz_logout'));
      }
    }

    // Handle 429 Too Many Requests (Rate Limit Exceeded)
    if (status === 429) {
      const rateLimitMsg = error.response?.data?.message || '⚠️ Too many requests. Please wait a moment before trying again.';
      toast.error(rateLimitMsg);
      return Promise.reject(error.response?.data || { message: rateLimitMsg });
    }

    // Suppress toast for silent profile checks if unauthenticated
    if (status !== 401 || originalRequest.url?.includes('/auth/login')) {
      toast.error(message);
    }

    return Promise.reject(error.response?.data || { message });
  }
);
