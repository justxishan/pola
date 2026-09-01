import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pola_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Infer which login page to redirect to based on the current URL pathname.
 * This avoids the bug where a farmer/delivery/admin 401 always dumped the user
 * onto the customer login page instead of their own portal login.
 */
const getPortalLoginPath = (): string => {
  const path = window.location.pathname;
  if (path.startsWith('/farmer')) return '/farmer/login';
  if (path.startsWith('/delivery')) return '/delivery/login';
  if (path.startsWith('/admin')) return '/admin/login';
  return '/customer/login';
};

// Response Interceptor: Handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('pola_token');
      localStorage.removeItem('pola_user');

      const publicPaths = ['/catalog', '/product/', '/auth/', '/portals', '/portal-select'];
      const isPublicPath = publicPaths.some((p) => window.location.pathname.startsWith(p));
      const isAlreadyOnLogin = window.location.pathname.includes('/login');

      if (!isPublicPath && !isAlreadyOnLogin) {
        // Use history.pushState for a soft redirect to avoid full page reload.
        // A full reload (window.location.href) would wipe the in-memory Zustand cart.
        const loginPath = getPortalLoginPath();
        window.history.pushState({}, '', loginPath);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    }
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);
