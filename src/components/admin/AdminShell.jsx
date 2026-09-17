import { Outlet, Link } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { ROUTES } from '../../config/routes';
import './AdminShell.css';

export default function AdminShell() {
  const { user, isAdmin, logout } = useAdminAuth();

  return (
    <div className="admin-shell">
      <header className="admin-shell__topbar">
        <Link to={ROUTES.adminDashboard} className="admin-shell__brand">
          MeShape <span>Admin</span>
        </Link>
        <div className="admin-shell__topbar-right">
          <Link to={ROUTES.home} className="admin-shell__view-site">
            ← View Site
          </Link>
          {isAdmin && user && (
            <>
              <span className="admin-shell__user">{user.email}</span>
              <button type="button" className="admin-shell__logout" onClick={logout}>
                Sign Out
              </button>
            </>
          )}
        </div>
      </header>
      <Outlet />
      <footer className="admin-shell__footer">Designed &amp; Developed by Craft Tech</footer>
    </div>
  );
}
