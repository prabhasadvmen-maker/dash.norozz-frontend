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

    if (status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/login')) {
      originalRequest._retry = true;
      const isSuperAdminReq = originalRequest.url?.includes('/super-admin/');
      if (!isSuperAdminReq) {
        try {
          await axios.post(`${API_BASE_URL}/auth/customer/refresh-token`, {}, { withCredentials: true });
          return axiosInstance(originalRequest);
        } catch {
          localStorage.removeItem('norozz_user');
          sessionStorage.removeItem('norozz_user');
          window.dispatchEvent(new Event('norozz_logout'));
        }
      } else {
        localStorage.removeItem('norozz_user');
        sessionStorage.removeItem('norozz_user');
        window.dispatchEvent(new Event('norozz_logout'));
      }
    }

    // Handle 429 Too Many Requests (Rate Limit Exceeded)
    if (status === 429) {
      const rateLimitMsg = error.response?.data?.message || '⚠️ Too many requests. Please wait a moment before trying again.';
      toast.error(rateLimitMsg);
      return Promise.reject(error.response?.data || { message: rateLimitMsg });
    }

    // Suppress toast for 401s on auth/login and super-admin routes
    const isSuperAdminRoute = originalRequest.url?.includes('/super-admin/');
    const isAuthLoginRoute = originalRequest.url?.includes('/auth/login');
    if (status !== 401 || isAuthLoginRoute) {
      if (!isSuperAdminRoute || status !== 401) {
        toast.error(message);
      }
    }

    return Promise.reject(error.response?.data || { message });
  }
);
