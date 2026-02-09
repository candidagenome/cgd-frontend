/**
 * ProtectedRoute component for guarding curator-only routes.
 *
 * Redirects unauthenticated users to the login page.
 * Shows loading spinner while checking auth state.
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Wrapper component that protects routes requiring authentication.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The protected content
 */
function ProtectedRoute({ children }) {
  const { loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="loading-container" style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Checking authentication...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Save the attempted URL for redirecting after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;
