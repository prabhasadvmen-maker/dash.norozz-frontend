import axios from 'axios';
import { toast } from '../utils/toast.js';
import { TOKEN_KEY } from '../contexts/authKeys.js';

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

// "user_token" -> "user_refresh_token", "partner_token" -> "partner_refresh_token", ...
const refreshKeyOf = (tokenKey) => tokenKey.replace(/_token$/, '_refresh_token');

// Impersonation tab: sessionStorage only (tab-local). Normal tab: localStorage only.
const getStorage = () =>
  sessionStorage.getItem('norozz_impersonation_tab') === '1' ? sessionStorage : localStorage;

// Finds the token to send for this request and the storage key it lives under
const resolveToken = (url) => {
  const storage = getStorage();

  let preferredKey = null;
  if (url) {
    if (url.includes('/partner/')) preferredKey = 'partner_token';
    else if (url.includes('/super-admin/')) preferredKey = 'superadmin_token';
    else if (url.includes('/city-admin/')) preferredKey = 'cityadmin_token';
    else if (url.includes('/customer/')) preferredKey = 'user_token';
  }

  // Shared endpoints (e.g. /dispatch/...) have no role in the URL: use the portal the user is currently on,
  // otherwise another portal's token (e.g. superadmin) saved in the same browser would be sent instead.
  if (!preferredKey && typeof window !== 'undefined') {
    const path = window.location.pathname;
    if (path.startsWith('/partner')) preferredKey = 'partner_token';
    else if (path.startsWith('/super-admin')) preferredKey = 'superadmin_token';
    else if (path.startsWith('/city-admin')) preferredKey = 'cityadmin_token';
    else preferredKey = 'user_token';
  }

  if (preferredKey) {
    const t = storage.getItem(preferredKey);
    if (t) return { key: preferredKey, token: t };
  }

  for (const key of TOKEN_KEYS) {
    const t = storage.getItem(key);
    if (t) return { key, token: t };
  }
  return { key: null, token: null };
};

const clearAllTokens = () => {
  TOKEN_KEYS.forEach((k) => {
    [k, refreshKeyOf(k)].forEach((key) => {
      try { localStorage.removeItem(key); } catch { /* storage unavailable */ }
      try { sessionStorage.removeItem(key); } catch { /* storage unavailable */ }
    });
  });
};

// Login responses carry { user, accessToken, refreshToken }: keep the refresh token per role
const captureRefreshToken = (body) => {
  const refreshToken = body?.data?.refreshToken;
  const role = body?.data?.user?.role;
  const tokenKey = role && TOKEN_KEY[role];
  if (refreshToken && tokenKey) {
    try { getStorage().setItem(refreshKeyOf(tokenKey), refreshToken); } catch { /* storage unavailable */ }
  }
};

// Public auth endpoints: a 401 here means wrong credentials/OTP, never an expired session
const PUBLIC_AUTH_URL = /\/(login|signup|otp\/request|otp\/verify|otp-login\/(request|verify)|refresh-token|forgot-password|reset-password)(\?|$)/;

// One refresh at a time per role, so parallel 401s share a single refresh call
const refreshInFlight = {};

const refreshAccessToken = (tokenKey) => {
  if (!refreshInFlight[tokenKey]) {
    refreshInFlight[tokenKey] = (async () => {
      const storage = getStorage();
      const refreshToken = storage.getItem(refreshKeyOf(tokenKey));
      try {
        // Falls back to the httpOnly refresh cookie when no token is stored (e.g. admin logins)
        const res = await axios.post(
          `${API_BASE_URL}/customer/auth/refresh-token`,
          refreshToken ? { token: refreshToken } : {},
          { withCredentials: true }
        );
        const newToken = res.data?.data?.accessToken;
        if (!newToken) throw Object.assign(new Error('No access token returned'), { fatal: true });
        storage.setItem(tokenKey, newToken);
        return newToken;
      } catch (err) {
        const status = err.response?.status;
        // Only an explicit rejection of the refresh token ends the session; network/5xx errors must not log the user out
        err.fatal = err.fatal || status === 400 || status === 401 || status === 403;
        throw err;
      } finally {
        delete refreshInFlight[tokenKey];
      }
    })();
  }
  return refreshInFlight[tokenKey];
};

// ─── Request Interceptor ─────────────────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    // Respect an explicit Authorization header (e.g. fresh token during profile setup, before it is stored under user_token)
    if (!config.headers['Authorization']) {
      const { key, token } = resolveToken(config.url);
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
        config._tokenKey = key;
      }
    }
    if (config.data instanceof FormData) delete config.headers['Content-Type'];
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ────────────────────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => {
    captureRefreshToken(response.data);
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config || {};
    const status  = error.response?.status;
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';

    // Silent refresh: expired access token -> get a new one with the refresh token and retry once
    if (
      status === 401 &&
      !originalRequest._retry &&
      originalRequest._tokenKey &&
      !PUBLIC_AUTH_URL.test(originalRequest.url || '')
    ) {
      originalRequest._retry = true;
      try {
        const newToken = await refreshAccessToken(originalRequest._tokenKey);
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshErr) {
        if (refreshErr.fatal) {
          clearAllTokens();
          window.dispatchEvent(new Event('norozz_logout'));
        }
        // Network/server problem: keep the session, just fail this request
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
    if (!(status === 401 && isProtectedPortal) && !originalRequest.silent) {
      toast.error(message);
    }

    return Promise.reject(error.response?.data || { message });
  }
);
