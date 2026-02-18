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

// Default refresh interval: 10 minutes (safe default if backend doesn't specify)
// Will be overridden by actual expires_in from backend if provided
const DEFAULT_REFRESH_INTERVAL_MS = 10 * 60 * 1000;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const refreshTimerRef = useRef(null);
  const isMountedRef = useRef(true);

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
   * @param {number} [intervalMs] - Optional interval in milliseconds. If not provided, uses default.
   */
  const setupRefreshTimer = useCallback((intervalMs) => {
    // Clear any existing timer first
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    const interval = intervalMs || DEFAULT_REFRESH_INTERVAL_MS;
    console.log(`Setting up token refresh every ${Math.round(interval / 60000)} minutes`);

    refreshTimerRef.current = setInterval(async () => {
      if (!isMountedRef.current) return;

      try {
        console.log('Attempting token refresh...');
        const result = await authApi.refresh();
        console.log('Token refresh successful');

        // If backend returns new expires_in, adjust the timer
        if (result?.expires_in && result.expires_in > 0) {
          const newInterval = Math.max((result.expires_in - 60) * 1000, 60000); // Refresh 1 min before expiry, min 1 min
          if (Math.abs(newInterval - interval) > 60000) {
            // Only reschedule if significantly different
            setupRefreshTimer(newInterval);
          }
        }
      } catch (err) {
        console.error('Token refresh failed:', err.response?.status, err.response?.data);
        if (!isMountedRef.current) return;
        // If refresh fails, user needs to re-login
        setUser(null);
        setError('Your session has expired. Please log in again.');
        if (refreshTimerRef.current) {
          clearInterval(refreshTimerRef.current);
          refreshTimerRef.current = null;
        }
      }
    }, interval);
  }, []);

  /**
   * Check authentication status on mount and listen for session expiry.
   * Uses empty dependency array to run only once on mount.
   */
  useEffect(() => {
    isMountedRef.current = true;

    const checkAuth = async () => {
      try {
        const userData = await authApi.getMe();
        if (!isMountedRef.current) return;
        setUser(userData);
        setupRefreshTimer();
      } catch {
        // Not authenticated or token expired
        if (!isMountedRef.current) return;
        setUser(null);
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    const handleSessionExpired = () => {
      console.warn('Session expired - logging out');
      if (!isMountedRef.current) return;
      setUser(null);
      setError('Your session has expired. Please log in again.');
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };

    checkAuth();

    // Listen for session expiry events from the API interceptor
    window.addEventListener('auth:session-expired', handleSessionExpired);

    return () => {
      isMountedRef.current = false;
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, [setupRefreshTimer]);

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
      const loginResult = await authApi.login(username, password);

      // Fetch user info
      const userData = await authApi.getMe();
      setUser(userData);

      // Set up refresh timer based on backend's expires_in, or use default
      // Refresh 1 minute before expiry, with a minimum of 1 minute
      let refreshInterval = DEFAULT_REFRESH_INTERVAL_MS;
      if (loginResult?.expires_in && loginResult.expires_in > 0) {
        refreshInterval = Math.max((loginResult.expires_in - 60) * 1000, 60000);
        console.log(`Token expires in ${loginResult.expires_in}s, will refresh in ${Math.round(refreshInterval / 1000)}s`);
      }
      setupRefreshTimer(refreshInterval);

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
