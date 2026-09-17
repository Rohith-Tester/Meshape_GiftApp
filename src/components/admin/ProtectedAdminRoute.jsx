import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { ROUTES } from '../../config/routes';
import './ProtectedAdminRoute.css';

/**
 * Guards /admin/dashboard using the real, token-verified `isAdmin` flag
 * from AdminAuthContext (see that file for why this is genuine
 * authorization, not a client-side trust flag).
 *
 * The `initializing` check matters: Firebase's SDK resolves whether
 * someone is signed in asynchronously, reading from its own local
 * session storage before confirming with its servers. Without waiting
 * for that to settle, a genuinely signed-in admin would see a flash
 * redirect to /admin on every page load before `isAdmin` becomes true.
 * This is a UX guard, not a security one — Firestore itself never trusts
 * this component either way.
 */
export default function ProtectedAdminRoute({ children }) {
  const { isAdmin, initializing } = useAdminAuth();

  if (initializing) {
    return (
      <div className="protected-admin-route__loading" role="status" aria-live="polite">
        Checking admin session…
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to={ROUTES.adminLogin} replace />;
  }

  return children;
}
