import axios from 'axios';

// In development, use relative URLs to leverage Vite's proxy (avoids CORS issues)
// In production, use the configured API URL or empty string for same-origin deployment
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Include cookies in requests (needed for HttpOnly auth cookies)
  withCredentials: true,
});

/**
 * Request interceptor - add auth token to requests.
 *
 * The access token is stored in an HttpOnly cookie by the server,
 * which is automatically included with withCredentials: true.
 * This interceptor is here for future use if we need header-based auth.
 */
api.interceptors.request.use(
  (config) => {
    // Token is in HttpOnly cookie, automatically sent by browser
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - handle auth errors.
 *
 * - 401: Token expired or invalid - could trigger refresh
 * - 403: Forbidden - user doesn't have permission
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If we get a 401 and haven't retried yet, try refreshing the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Skip refresh attempt for auth endpoints to avoid infinite loops
      if (originalRequest.url?.includes('/api/auth/')) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        // Attempt to refresh the token
        await api.post('/api/auth/refresh');
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - user needs to re-login
        // Dispatch a custom event that the AuthContext can listen to
        window.dispatchEvent(new CustomEvent('auth:session-expired'));
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
