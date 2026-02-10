/**
 * Authentication context for managing curator login state.
 *
 * Provides:
 * - User authentication state
 * - Login/logout functions
 * - Automatic token refresh
 * - Persistent auth state across page reloads
 */
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import authApi from '../api/authApi';

const AuthContext = createContext(null);

// Token refresh interval (30 minutes before expiry, assuming 4 hour access token)
const REFRESH_INTERVAL_MS = 210 * 60 * 1000; // 3.5 hours

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const refreshTimerRef = useRef(null);

  /**
   * Clear the refresh timer.
   */
  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  /**
   * Set up automatic token refresh.
   */
  const setupRefreshTimer = useCallback(() => {
    clearRefreshTimer();

    refreshTimerRef.current = setInterval(async () => {
      try {
        console.log('Attempting token refresh...');
        await authApi.refresh();
        console.log('Token refresh successful');
      } catch (err) {
        console.error('Token refresh failed:', err.response?.status, err.response?.data);
        // If refresh fails, user needs to re-login
        setUser(null);
        setError('Your session has expired. Please log in again.');
        clearRefreshTimer();
      }
    }, REFRESH_INTERVAL_MS);
  }, [clearRefreshTimer]);

  /**
   * Handle session expiry event from API interceptor.
   */
  const handleSessionExpired = useCallback(() => {
    console.warn('Session expired - logging out');
    setUser(null);
    setError('Your session has expired. Please log in again.');
    clearRefreshTimer();
  }, [clearRefreshTimer]);

  /**
   * Check authentication status on mount and listen for session expiry.
   */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await authApi.getMe();
        setUser(userData);
        setupRefreshTimer();
      } catch {
        // Not authenticated or token expired
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for session expiry events from the API interceptor
    window.addEventListener('auth:session-expired', handleSessionExpired);

    return () => {
      clearRefreshTimer();
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, [setupRefreshTimer, clearRefreshTimer, handleSessionExpired]);

  /**
   * Login with credentials.
   *
   * @param {string} username - Oracle userid
   * @param {string} password - Oracle password
   * @returns {Promise<Object>} User data on success
   * @throws {Error} On authentication failure
   */
  const login = useCallback(async (username, password) => {
    setError(null);

    try {
      // Call login endpoint
      await authApi.login(username, password);

      // Fetch user info
      const userData = await authApi.getMe();
      setUser(userData);
      setupRefreshTimer();

      return userData;
    } catch (err) {
      const message = err.response?.data?.detail || 'Login failed';
      setError(message);
      throw new Error(message);
    }
  }, [setupRefreshTimer]);

  /**
   * Logout current user.
   */
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (err) {
      // Continue with client-side logout even if server call fails
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setError(null);
      clearRefreshTimer();
    }
  }, [clearRefreshTimer]);

  /**
   * Clear any authentication errors.
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context.
 *
 * @returns {{
 *   user: Object|null,
 *   loading: boolean,
 *   error: string|null,
 *   isAuthenticated: boolean,
 *   login: Function,
 *   logout: Function,
 *   clearError: Function
 * }}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
