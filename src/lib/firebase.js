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

/**
 * NOTHING in this file is imported statically (NEW-23).
 *
 * This module used to `import ... from 'firebase/app'` and
 * 'firebase/firestore' at the top. Because every storefront context
 * imports this file, those two imports put the entire Firestore SDK on
 * the critical path: 397 kB of JavaScript — plus the 247 kB `re2js`
 * regex engine Firestore depends on and this app never uses — had to be
 * downloaded, parsed and executed before React could render a single
 * pixel. On a throttled mobile connection that was most of a 2.8 s
 * First Contentful Paint, for data that nothing on screen needs until
 * after the page has been drawn.
 *
 * Both are now reached only through dynamic import(), so Rollup emits
 * them as separate chunks that the browser fetches in parallel with —
 * not ahead of — the first paint. The page renders its skeletons
 * immediately and fills in when the data arrives, which is the
 * behaviour the loading states in each context were already written
 * for.
 *
 * Each loader memoizes its promise, so however many contexts call it,
 * the SDK is fetched, initialized and connected exactly once.
 */

let appPromise = null;

/**
 * The Firebase app handle. Kept separate from the Firestore loader
 * because AdminAuthContext needs the app for Auth but never touches
 * Firestore through it.
 *
 * getApps()/getApp() guard against re-initializing during Vite's
 * dev-mode hot module replacement, which would otherwise throw.
 */
export function loadFirebaseApp() {
  if (!appPromise) {
    appPromise = import('firebase/app').then(({ initializeApp, getApps, getApp }) =>
      getApps().length ? getApp() : initializeApp(firebaseConfig)
    );
  }
  return appPromise;
}

let firestorePromise = null;

/**
 * Resolves to `{ db, fs }` — the Firestore instance and the module's
 * namespace, so callers can use `fs.collection`, `fs.onSnapshot` and so
 * on without importing 'firebase/firestore' themselves (which would put
 * it straight back on the critical path).
 *
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
export function loadFirestore() {
  if (!firestorePromise) {
    firestorePromise = (async () => {
      const [app, fs] = await Promise.all([loadFirebaseApp(), import('firebase/firestore')]);
      let db;
      try {
        db = fs.initializeFirestore(app, {
          localCache: fs.persistentLocalCache({ tabManager: fs.persistentMultipleTabManager() }),
        });
      } catch {
        db = fs.getFirestore(app);
      }
      return { db, fs };
    })();
  }
  return firestorePromise;
}
