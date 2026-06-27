import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach user token
api.interceptors.request.use((config) => {
  // Check if this is an admin request
  const isAdminReq = config.url?.includes('/admin');
  const tokenKey = isAdminReq ? 'admin_token' : 'lensique_token';
  const token = localStorage.getItem(tokenKey);

  // For non-admin requests, also try user token
  if (!token && !isAdminReq) {
    const userToken = localStorage.getItem('lensique_token');
    if (userToken) config.headers.Authorization = `Bearer ${userToken}`;
  } else if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Remove Content-Type for FormData (let browser set multipart boundary)
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
});

// Handle 401/403 globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Determine if admin or user context
      const path = window.location.pathname;
      if (path.startsWith('/admin')) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        if (path !== '/admin/login') {
          window.location.href = '/admin/login';
        }
      } else {
        localStorage.removeItem('lensique_token');
        localStorage.removeItem('lensique_user');
        if (path !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
