import axios from 'axios';
import { toast } from '../utils/toast.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// All role-based token keys in priority order
const TOKEN_KEYS = [
  'superadmin_token',
  'cityadmin_token',
  'partner_token',
  'user_token',
  'norozz_token', // legacy fallback
];

const getActiveToken = () => {
  // Impersonation tab: sessionStorage only (tab-local)
  // Normal tab: localStorage only
  const isImpersonationTab = sessionStorage.getItem('norozz_impersonation_tab') === '1';
  const storage = isImpersonationTab ? sessionStorage : localStorage;

  for (const key of TOKEN_KEYS) {
    const t = storage.getItem(key);
    if (t) return t;
  }
  return null;
};

const clearAllTokens = () => {
  TOKEN_KEYS.forEach((k) => {
    try { localStorage.removeItem(k); } catch {}
    try { sessionStorage.removeItem(k); } catch {}
  });
};

// ─── Request Interceptor ─────────────────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getActiveToken();
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    if (config.data instanceof FormData) delete config.headers['Content-Type'];
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ────────────────────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    const status  = error.response?.status;
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';

    if (status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/')) {
      originalRequest._retry = true;
      const isCustomerRoute = !originalRequest.url?.includes('/super-admin/') &&
                              !originalRequest.url?.includes('/city-admin/') &&
                              !originalRequest.url?.includes('/partner/');
      if (isCustomerRoute) {
        try {
          await axios.post(`${API_BASE_URL}/auth/customer/refresh-token`, {}, { withCredentials: true });
          return axiosInstance(originalRequest);
        } catch {
          clearAllTokens();
          window.dispatchEvent(new Event('norozz_logout'));
        }
      } else {
        clearAllTokens();
        window.dispatchEvent(new Event('norozz_logout'));
      }
    }

    if (status === 429) {
      const msg = error.response?.data?.message || 'Too many requests. Please wait a moment.';
      toast.error(msg);
      return Promise.reject(error.response?.data || { message: msg });
    }

    // Suppress 401 toasts on protected portals (they trigger logout silently)
    const isProtectedPortal = originalRequest.url?.includes('/super-admin/') ||
                              originalRequest.url?.includes('/city-admin/') ||
                              originalRequest.url?.includes('/partner/');
    if (!(status === 401 && isProtectedPortal)) {
      toast.error(message);
    }

    return Promise.reject(error.response?.data || { message });
  }
);
