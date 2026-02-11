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

// Track refresh state to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshSubscribers = [];

/**
 * Subscribe to token refresh completion.
 * @param {Function} callback - Called when refresh completes
 */
const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

/**
 * Notify all subscribers that refresh is complete.
 * @param {Error|null} error - Error if refresh failed, null if successful
 */
const onRefreshComplete = (error) => {
  refreshSubscribers.forEach((callback) => callback(error));
  refreshSubscribers = [];
};

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
 * - 401: Token expired or invalid - triggers refresh
 * - 403: Forbidden - user doesn't have permission
 *
 * Uses a queue to handle multiple concurrent 401 errors - only one refresh
 * request is made, and all failed requests are retried after refresh completes.
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If we get a 401 and haven't retried yet, try refreshing the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Skip refresh attempt for auth endpoints to avoid infinite loops
      if (originalRequest.url?.includes('/api/auth/')) {
        console.warn('Auth endpoint returned 401:', originalRequest.url);
        return Promise.reject(error);
      }

      console.log('Got 401 for:', originalRequest.url, '- attempting token refresh');

      // If already refreshing, wait for the refresh to complete
      if (isRefreshing) {
        console.log('Refresh already in progress, queuing request:', originalRequest.url);
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((refreshError) => {
            if (refreshError) {
              reject(error);
            } else {
              // Retry the original request
              originalRequest._retry = true;
              resolve(api(originalRequest));
            }
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the token
        console.log('Calling /api/auth/refresh...');
        await api.post('/api/auth/refresh');
        console.log('Token refresh successful');

        isRefreshing = false;
        onRefreshComplete(null);

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError.response?.status, refreshError.response?.data);

        isRefreshing = false;
        onRefreshComplete(refreshError);

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
