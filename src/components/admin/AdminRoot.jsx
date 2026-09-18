import { AdminAuthProvider } from '../../context/AdminAuthContext';
import AdminShell from './AdminShell';

/**
 * Root of the admin route tree.
 *
 * Fix (NEW-23): AdminAuthProvider used to sit in App.jsx, wrapping the
 * entire application. That meant its onAuthStateChanged listener — and
 * therefore the whole Firebase Auth bootstrap, including a 93 kB
 * /__/auth/iframe.js request — ran for every customer browsing the
 * storefront, none of whom can sign in.
 *
 * Pairing the provider with the shell in one lazily-loaded component
 * keeps all of it inside the admin chunk, so the cost is paid only when
 * someone actually navigates to /admin. The auth code was already the
 * only consumer of `auth`, so nothing on the storefront regresses.
 */
export default function AdminRoot() {
  return (
    <AdminAuthProvider>
      <AdminShell />
    </AdminAuthProvider>
  );
}
