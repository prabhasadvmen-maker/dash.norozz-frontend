const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Older records store absolute http://localhost:<port>/api/media/... URLs; point them at the live API instead.
export const resolveMediaUrl = (url) => {
  if (typeof url !== 'string') return url;
  return url.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/api\//, `${API_BASE_URL.replace(/\/$/, '')}/`);
};
