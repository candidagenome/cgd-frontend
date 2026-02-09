/**
 * Authentication API module for curator login.
 *
 * Handles login, logout, token refresh, and user info retrieval.
 */
import api from './config';

export const authApi = {
  /**
   * Login with curator credentials.
   *
   * @param {string} username - Oracle userid
   * @param {string} password - Oracle password
   * @returns {Promise<{access_token: string, token_type: string, expires_in: number}>}
   */
  login: async (username, password) => {
    const response = await api.post('/api/auth/login', {
      username,
      password,
    });
    return response.data;
  },

  /**
   * Logout and revoke session.
   *
   * @returns {Promise<{message: string}>}
   */
  logout: async () => {
    const response = await api.post('/api/auth/logout');
    return response.data;
  },

  /**
   * Refresh access token using refresh token cookie.
   *
   * @returns {Promise<{access_token: string, token_type: string, expires_in: number}>}
   */
  refresh: async () => {
    const response = await api.post('/api/auth/refresh');
    return response.data;
  },

  /**
   * Get current user information.
   *
   * @returns {Promise<{dbuser_no: number, userid: string, first_name: string, last_name: string, email: string, status: string}>}
   */
  getMe: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  /**
   * Check if user is authenticated.
   *
   * @returns {Promise<{authenticated: boolean, userid: string}>}
   */
  checkAuth: async () => {
    const response = await api.get('/api/auth/check');
    return response.data;
  },
};

export default authApi;
