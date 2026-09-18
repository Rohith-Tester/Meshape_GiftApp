import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  browserLocalPersistence,
  getAuth,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { loadFirebaseApp } from '../lib/firebase';
import { createIdleWatcher } from '../utils/idleWatcher';

const AdminAuthContext = createContext(null);

/**
 * The Firebase app itself is now loaded on demand (NEW-23), so this
 * wraps the two steps — fetch the app, then attach Auth to it — behind
 * one memoized promise. Every caller below awaits the same instance.
 */
let authPromise = null;
function loadAuth() {
  if (!authPromise) {
    authPromise = loadFirebaseApp().then(async (app) => {
      const auth = getAuth(app);
      /**
       * Security audit 2026-09-18 (SEC-10): persistence is now declared
       * rather than inherited. Firebase's default already IS
       * browserLocalPersistence, so this changes no behaviour today —
       * the point is that the choice is explicit and reviewable, and it
       * cannot be silently changed by an SDK default shifting under us.
       *
       * Local (not session) persistence is deliberate: the shop owner
       * expects to stay signed in between visits. The risk that creates
       * — an unattended session on the shop's counter machine — is
       * bounded by the idle timeout below instead, which is the control
       * that actually fits the threat.
       *
       * setPersistence must be awaited BEFORE any sign-in call, which is
       * why it lives inside this memoized loader that every caller
       * already awaits.
       */
      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch {
        // A browser with IndexedDB blocked (private mode, locked-down
        // policy) rejects this. Firebase falls back to in-memory
        // persistence on its own, which is strictly safer, not less
        // safe — so carry on rather than blocking sign-in entirely.
      }
      return auth;
    });
  }
  return authPromise;
}

/**
 * Security audit 2026-09-18 (SEC-10): how long an admin may sit idle
 * before being signed out. Firebase itself imposes no such limit — a
 * session persisted in IndexedDB survives closing the browser and lasts
 * indefinitely. On the shop's own machine that means the next person to
 * touch the keyboard inherits full write access to products, offers and
 * the gallery.
 *
 * 30 minutes is long enough not to interrupt real editing work (the
 * timer resets on any interaction) and short enough that an abandoned
 * session does not stay open all day.
 */
const IDLE_TIMEOUT_MS = 30 * 60 * 1000;

/**
 * Security audit 2026-09-18 (SEC-11): how often to re-check the admin
 * claim against Firebase with a FORCED token refresh.
 *
 * getIdTokenResult() without an argument reads the cached token, so
 * revoking a user's admin claim left them holding a dashboard that kept
 * working until Firebase's own roughly-hourly refresh happened to run.
 * Ten minutes bounds that window without meaningful cost — a token
 * refresh is one small request.
 *
 * NOTE: this closes the UI half only. An ID token already issued stays
 * cryptographically valid until it expires, so firestore.rules will keep
 * accepting that user's WRITES for up to an hour regardless of what this
 * app does. Closing that properly requires revokeRefreshTokens() plus an
 * auth_time check in the rules — see the audit report.
 */
const CLAIM_RECHECK_MS = 10 * 60 * 1000;

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
  // Resolved inside the effect below rather than at module scope, so
  // customers never bootstrap Firebase Auth at all (NEW-23).
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  // True until Firebase's SDK has resolved whether anyone is signed in.
  // Consumers (ProtectedAdminRoute) must wait for this before deciding
  // whether to redirect, or a signed-in admin would flash a redirect to
  // /admin on every page load before the SDK finishes checking.
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe = null;

    loadAuth()
      .then((auth) => {
        if (cancelled) return;
        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
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
      })
      .catch(() => {
        // Auth could not be loaded at all (offline, blocked request).
        // Stop blocking ProtectedAdminRoute — with no user, it redirects
        // to the login form, which is the correct end state here.
        if (!cancelled) setInitializing(false);
      });

    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const login = useCallback(async (email, password) => {
    // Throws on invalid credentials — callers (AdminLogin.jsx) catch this
    // and show an inline error. No credential ever touches this app's own
    // code; Firebase's servers verify the password hash.
    const auth = await loadAuth();
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const logout = useCallback(async () => {
    const auth = await loadAuth();
    await signOut(auth);
  }, []);

  /**
   * Security audit 2026-09-18 (SEC-10 and SEC-11).
   *
   * Two jobs, one effect, because both only make sense while somebody is
   * signed in and both must be torn down the moment they are not:
   *
   *   SEC-10  Sign the session out after IDLE_TIMEOUT_MS without any
   *           interaction. Firebase imposes no session lifetime of its
   *           own, so without this an admin session left open on the
   *           shop's machine stays usable indefinitely.
   *
   *   SEC-11  Re-check the admin claim against Firebase every
   *           CLAIM_RECHECK_MS with a forced token refresh, and again
   *           whenever the tab regains focus. Without the force flag the
   *           check reads a cached token and a revoked claim goes
   *           unnoticed for up to an hour.
   *
   * `user` is the only dependency: `logout` is a stable useCallback, and
   * the timers are held in refs so resetting the idle countdown on every
   * keystroke never triggers a re-render.
   */
  useEffect(() => {
    // Nobody signed in: nothing to expire and nothing to re-verify.
    // Returning early also means customers never attach these listeners
    // or run these timers at all.
    if (!user) return undefined;

    let cancelled = false;

    const watcher = createIdleWatcher({
      timeoutMs: IDLE_TIMEOUT_MS,
      onIdle: () => {
        // logout() flips the auth state, which re-runs this effect with
        // user === null and tears everything down via the cleanup below.
        logout().catch(() => {
          // Sign-out can fail offline. Drop the local view of the
          // session anyway — leaving the dashboard open is the one
          // outcome this timeout exists to prevent.
          if (!cancelled) {
            setUser(null);
            setIsAdmin(false);
          }
        });
      },
    });

    /**
     * Forced refresh (the `true`). This is the whole point of SEC-11 —
     * without it Firebase hands back the cached token and a revoked
     * admin claim still reads as `admin: true`.
     */
    const reverifyClaim = async () => {
      try {
        const tokenResult = await user.getIdTokenResult(true);
        if (!cancelled) setIsAdmin(tokenResult.claims.admin === true);
      } catch {
        // A network blip must not revoke a working session, so failure
        // leaves isAdmin as it stands; the next tick tries again. A
        // token that is genuinely invalid fails at Firestore regardless,
        // which is the boundary that actually matters.
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      // Returning to a tab left open for hours: treat it as activity,
      // and take the opportunity to re-check the claim immediately.
      watcher.notifyActivity();
      reverifyClaim();
    };

    watcher.start();
    const claimInterval = setInterval(reverifyClaim, CLAIM_RECHECK_MS);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelled = true;
      watcher.stop();
      clearInterval(claimInterval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [user, logout]);

  // Fix (NEW-15): this object was rebuilt on every render, unlike
  // every other context in the app, so all consumers re-rendered
  // each time regardless of whether anything had changed.
  const value = useMemo(
    () => ({ user, isAdmin, initializing, login, logout }),
    [user, isAdmin, initializing, login, logout]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  return ctx;
}
