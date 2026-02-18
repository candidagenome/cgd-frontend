import axios from 'axios';

// Use configured API URL, or default to backend.dev for dev environment
// In production, set VITE_API_URL appropriately
const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (window.location.hostname.includes('dev.candidagenome.org')
    ? 'https://backend.dev.candidagenome.org'
    : '');

// Store access token in memory (not localStorage for security)
// This is used for Authorization header since browsers block cross-site cookies
let accessToken = null;

/**
 * Set the access token for API requests.
 * Called after successful login.
 */
export const setAccessToken = (token) => {
  accessToken = token;
};

/**
 * Clear the access token.
 * Called on logout or session expiry.
 */
export const clearAccessToken = () => {
  accessToken = null;
};

/**
 * Get the current access token.
 */
export const getAccessToken = () => accessToken;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Include cookies in requests (fallback for same-origin deployments)
  withCredentials: true,
});

// Track refresh state to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshSubscribers = [];
let lastRefreshTime = 0;
const REFRESH_COOLDOWN_MS = 5000; // Don't refresh again within 5 seconds of a successful refresh

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
 * Check if we recently refreshed successfully (within cooldown period).
 * If so, just retry the request without refreshing again.
 */
const recentlyRefreshed = () => {
  return Date.now() - lastRefreshTime < REFRESH_COOLDOWN_MS;
};

/**
 * Request interceptor - add auth token to requests.
 *
 * Adds Authorization header with Bearer token for cross-origin requests.
 * Modern browsers block cross-site cookies, so we use header-based auth.
 */
api.interceptors.request.use(
  (config) => {
    // Add Authorization header if we have a token
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
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

      // If we just refreshed successfully, just retry the request without refreshing again
      // This handles the case where a request was in-flight during refresh
      if (recentlyRefreshed()) {
        console.log('Recently refreshed, retrying request without refresh:', originalRequest.url);
        originalRequest._retry = true;
        return api(originalRequest);
      }

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
        const refreshResponse = await api.post('/api/auth/refresh');
        console.log('Token refresh successful');

        // Store the new access token
        if (refreshResponse.data?.access_token) {
          accessToken = refreshResponse.data.access_token;
        }

        lastRefreshTime = Date.now();
        isRefreshing = false;
        onRefreshComplete(null);

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError.response?.status, refreshError.response?.data);

        isRefreshing = false;
        accessToken = null; // Clear token on refresh failure
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
