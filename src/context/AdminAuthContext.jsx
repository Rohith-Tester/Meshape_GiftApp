import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

const AdminAuthContext = createContext(null);

/**
 * Real authentication and authorization, backed by Firebase Auth.
 *
 * How this differs from the Phase 6/7 placeholder it replaces:
 * that version set a plain boolean in sessionStorage that ANY script
 * running on the page (including one pasted into devtools) could flip to
 * `true` with zero verification. This version tracks Firebase's own
 * signed-in user object, and derives `isAdmin` from that user's ID token
 * — a JWT that Firebase's Auth servers cryptographically sign and that
 * Firestore independently re-verifies on every single request via
 * firestore.rules. A client can rewrite this file's logic entirely (or
 * just tamper with browser storage) and it changes nothing about whether
 * Firestore will actually accept a write — that check happens server-side,
 * not here. This context exists for UI convenience (so the app knows
 * whether to show a login form or the dashboard), not as the security
 * boundary itself.
 *
 * `isAdmin` is true only when the signed-in user's token carries a
 * custom claim `admin: true`. That claim is never set by this app — it
 * is granted once, out of band, by running admin-scripts/setAdminClaim.js
 * with a Firebase Admin SDK service account. A user who merely has valid
 * login credentials but no admin claim will authenticate successfully
 * (user !== null) but `isAdmin` stays false, and firestore.rules will
 * reject their writes regardless of what the UI does.
 */
export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  // True until Firebase's SDK has resolved whether anyone is signed in.
  // Consumers (ProtectedAdminRoute) must wait for this before deciding
  // whether to redirect, or a signed-in admin would flash a redirect to
  // /admin on every page load before the SDK finishes checking.
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          // Reads the claims embedded in the current ID token. Firebase
          // refreshes this token automatically roughly every hour, so a
          // claim change from admin-scripts/setAdminClaim.js is picked
          // up on the user's next natural token refresh (or immediately
          // if they sign in again).
          const tokenResult = await firebaseUser.getIdTokenResult();
          setIsAdmin(tokenResult.claims.admin === true);
        } catch {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }

      setInitializing(false);
    });

    return unsubscribe;
  }, []);

  const login = useCallback(async (email, password) => {
    // Throws on invalid credentials — callers (AdminLogin.jsx) catch this
    // and show an inline error. No credential ever touches this app's own
    // code; Firebase's servers verify the password hash.
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  const value = { user, isAdmin, initializing, login, logout };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  return ctx;
}
