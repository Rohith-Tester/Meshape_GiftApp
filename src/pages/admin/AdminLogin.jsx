import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { ROUTES } from '../../config/routes';
import { useDocumentHead } from '../../hooks/useDocumentHead';
import './AdminLogin.css';

/**
 * Real sign-in, backed by Firebase Auth (see AdminAuthContext.jsx). There
 * is no password check anywhere in this file or this app's code — the
 * `login()` call below hands the credential to Firebase's servers, which
 * verify it against a securely hashed password Firebase itself manages.
 * This app never sees, stores, or checks the password.
 *
 * There is deliberately no self-serve "create account" link here. The
 * one admin account is created once, out of band, in the Firebase
 * Console (or via a setup script) — see admin-scripts/README.md.
 */
const FIREBASE_ERROR_MESSAGES = {
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/too-many-requests': 'Too many attempts — please wait a few minutes and try again.',
  'auth/network-request-failed': 'Network error — check your connection and try again.',
};

export default function AdminLogin() {
  useDocumentHead({ title: 'Admin Login', noindex: true });

  const { user, isAdmin, initializing, login, logout } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (initializing) {
    return <div className="admin-login__checking">Checking admin session…</div>;
  }

  if (isAdmin) {
    return <Navigate to={ROUTES.adminDashboard} replace />;
  }

  // Signed in with valid Firebase credentials, but that account does not
  // carry the admin custom claim. Authentication succeeded; authorization
  // did not. Distinguishing these two failure modes matters — see
  // firestore.rules and AdminAuthContext.jsx.
  if (user && !isAdmin) {
    return (
      <div className="admin-login__content">
        <div className="admin-login__card">
          <h1>Signed In — Not an Admin Account</h1>
          <p className="admin-login__explainer">
            You're signed in as <strong>{user.email}</strong>, but this account doesn't have admin access. If this
            is unexpected, run <code>admin-scripts/setAdminClaim.js</code> for this account's UID, then sign out and
            back in.
          </p>
          <button type="button" className="admin-login__demo-btn" onClick={logout}>
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      // AdminAuthContext's onAuthStateChanged listener updates user/isAdmin
      // asynchronously; this component re-renders once that resolves.
    } catch (err) {
      setError(FIREBASE_ERROR_MESSAGES[err.code] || 'Sign-in failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login__content">
        <div className="admin-login__card">
          <h1>Admin Login</h1>
          <p className="admin-login__explainer">
            Sign in with the admin account. There is no self-serve sign-up — accounts are created directly in the
            Firebase Console.
          </p>

          <form className="admin-login__form" onSubmit={handleSubmit}>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </label>

            {error && (
              <p className="admin-login__error" role="alert">
                {error}
              </p>
            )}

            <button type="submit" className="admin-login__submit-btn" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
