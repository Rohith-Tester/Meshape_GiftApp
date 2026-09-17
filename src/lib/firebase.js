import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, getFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

/**
 * These values come from environment variables (see .env.example) and are
 * read into the client bundle by Vite because they're prefixed VITE_.
 *
 * None of this is a secret, despite "apiKey" sounding like one — these
 * values are Firebase's public project identifiers. Anyone can see them
 * in a deployed site's JS bundle by design; Firebase's own docs confirm
 * this. The real security boundary is Firestore Security Rules
 * (firestore.rules) plus Firebase Auth token verification, which happen
 * on Google's servers and cannot be bypassed by reading or editing
 * anything in this file or the deployed bundle. See
 * PROJECT_REQUIREMENTS.md → "Phase 8 architecture notes" for the full
 * explanation of why this is a genuine security boundary and the old
 * localStorage/sessionStorage demo-mode flag was not.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// getApps()/getApp() guard against re-initializing during Vite's dev-mode
// hot module replacement, which would otherwise throw.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);

/**
 * Without a local cache, every single page load — even a repeat visit
 * minutes later — has to wait for a fresh network round-trip to
 * Firestore before any product/gallery/offer data appears, since
 * ProductsContext/ShopGalleryContext/OffersContext all use a live
 * onSnapshot listener. That wait is the "gifts take a few seconds to
 * show up" delay, worse on weaker mobile connections.
 *
 * persistentLocalCache stores that data in IndexedDB, so the second and
 * every later visit renders instantly from cache while onSnapshot still
 * syncs any fresh changes in the background — the first-ever visit on a
 * device still needs one real network round-trip, which nothing client-
 * side can eliminate, but every visit after that is fast.
 * persistentMultipleTabManager keeps this correct if the shop is open
 * in more than one browser tab at once.
 *
 * initializeFirestore throws if called twice on the same app (e.g. Vite
 * HMR re-running this module during local dev) — the try/catch falls
 * back to the already-initialized instance instead of crashing.
 */
let firestoreDb;
try {
  firestoreDb = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  });
} catch {
  firestoreDb = getFirestore(app);
}
export const db = firestoreDb;

export default app;
