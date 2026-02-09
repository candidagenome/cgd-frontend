/**
 * Curator Login Page
 *
 * Provides a login form for curators to authenticate with their Oracle credentials.
 * Redirects to the originally requested page (or Curator Central) after login.
 */
import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the page user was trying to access, default to curator central
  const from = location.state?.from?.pathname || '/curation';

  // If already authenticated, redirect
  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (!username.trim() || !password) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login(username.trim(), password);
      // Navigate to the original destination
      navigate(from, { replace: true });
    } catch {
      // Error is already set in auth context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container" style={styles.container}>
        <h1 style={styles.title}>Curator Login</h1>

        {error && (
          <div style={styles.errorBox}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label htmlFor="username" style={styles.label}>
              <strong>User Name</strong>
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              autoComplete="username"
              autoFocus
              disabled={isSubmitting}
              maxLength={12}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>
              <strong>Password</strong>
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              autoComplete="current-password"
              disabled={isSubmitting}
            />
          </div>

          <div style={styles.buttonGroup}>
            <button
              type="submit"
              style={styles.submitButton}
              disabled={isSubmitting || !username.trim() || !password}
            >
              {isSubmitting ? 'Logging in...' : 'Submit'}
            </button>
          </div>
        </form>

        <div style={styles.helpText}>
          <p>
            <Link to="/contact">Contact CGD</Link> if you need assistance with your account.
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '400px',
    margin: '2rem auto',
    padding: '2rem',
    backgroundColor: '#f9f9f9',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  title: {
    marginTop: 0,
    marginBottom: '1rem',
    color: '#333',
    textAlign: 'center',
  },
  errorBox: {
    padding: '0.75rem 1rem',
    marginBottom: '1rem',
    backgroundColor: '#fee',
    border: '1px solid #fcc',
    borderRadius: '4px',
    color: '#c00',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  label: {
    fontSize: '0.95rem',
  },
  input: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  buttonGroup: {
    marginTop: '0.5rem',
    textAlign: 'center',
  },
  submitButton: {
    padding: '0.5rem 2rem',
    fontSize: '1rem',
    backgroundColor: '#337ab7',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  helpText: {
    marginTop: '1.5rem',
    textAlign: 'center',
    fontSize: '0.9rem',
    color: '#666',
  },
};

export default LoginPage;
