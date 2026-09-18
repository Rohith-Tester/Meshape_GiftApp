import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { loadFirestore } from '../lib/firebase';
import { fetchCollectionOnce } from '../lib/firestoreRest';

const ProductsContext = createContext(null);
const COLLECTION = 'products';

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Every page that displays products (Home, Products, ProductDetail,
 * search, related products, wishlist) reads from this context instead of
 * querying Firestore directly. That is what makes Admin's product CRUD
 * real: adding, editing, or deleting a product here changes what EVERY
 * customer sees, on every device — not just this browser, which is the
 * gap Phase 8 closes over the Phase 6/7 localStorage version.
 *
 * Reads are public (see firestore.rules: `allow read: if true` on
 * /products/{productId}) so the storefront works for anonymous shoppers.
 * Writes require the `admin` custom claim, enforced server-side by
 * Firestore itself — this file has no ability to bypass that; a failed
 * write here always means Firestore rejected it, not that this code
 * "let it through insecurely."
 *
 * `onSnapshot` keeps `products` live: if the admin (or another admin
 * device) changes something, every open tab of the storefront updates
 * without a page refresh.
 */
export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Fix (BUG-17): bumping this re-runs the effect below, which
  // tears down the failed listener and subscribes again — giving
  // DataLoadError a genuine retry instead of only telling the
  // customer to reload the whole page themselves.
  const [retryToken, setRetryToken] = useState(0);

  const retry = useCallback(() => {
    setError(null);
    setLoading(true);
    setRetryToken((n) => n + 1);
  }, []);

  // The Firestore SDK is fetched here rather than imported at the top of
  // the file (NEW-23), so it downloads alongside the first paint instead
  // of blocking it. `cancelled` covers the window where the component
  // unmounts — or retry() re-runs this effect — while the import is
  // still in flight, which would otherwise leak a live listener.
  useEffect(() => {
    let cancelled = false;
    let unsubscribe = null;
    // Set as soon as the SDK delivers a snapshot. The REST read below is
    // only a head start; once the SDK is live it owns the data, and a
    // slower REST response must never overwrite it.
    let sdkHasDelivered = false;
    const restAbort = new AbortController();

    // A plain HTTPS read that needs no SDK, so it can go out while the
    // SDK chunk is still downloading — this is what lets the first
    // product photos start loading about a second earlier (NEW-23).
    // A failure here is not an error state: the SDK is still coming.
    fetchCollectionOnce(COLLECTION, { signal: restAbort.signal })
      .then((docs) => {
        if (cancelled || sdkHasDelivered) return;
        setProducts(docs);
        setLoading(false);
      })
      .catch(() => {
        /* Ignored by design — see src/lib/firestoreRest.js. */
      });

    loadFirestore()
      .then(({ db, fs }) => {
        if (cancelled) return;
        unsubscribe = fs.onSnapshot(
          fs.collection(db, COLLECTION),
          (snapshot) => {
            sdkHasDelivered = true;
            setProducts(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })));
            setLoading(false);
            setError(null);
          },
          (err) => {
            // Common cause: firestore.rules not yet deployed, or Firebase
            // env vars missing/misconfigured. Surfaced to the UI rather than
            // failing silently — see EmptyState usage in Products.jsx/Home.jsx.
            setError(err.message);
            setLoading(false);
          }
        );
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setLoading(false);
      });

    return () => {
      cancelled = true;
      restAbort.abort();
      if (unsubscribe) unsubscribe();
    };
  }, [retryToken]);

  const getProductById = useCallback((id) => products.find((p) => p.id === id) || null, [products]);

  const addProduct = useCallback(
    async (data) => {
      let id = slugify(data.name);
      let suffix = 2;
      while (products.some((p) => p.id === id)) {
        id = `${slugify(data.name)}-${suffix}`;
        suffix += 1;
      }
      const { db, fs } = await loadFirestore();
      await fs.setDoc(fs.doc(db, COLLECTION, id), {
        ...data,
        createdAt: fs.serverTimestamp(),
        updatedAt: fs.serverTimestamp(),
      });
      return id;
    },
    [products]
  );

  const updateProduct = useCallback(async (id, updates) => {
    const { db, fs } = await loadFirestore();
    await fs.updateDoc(fs.doc(db, COLLECTION, id), { ...updates, updatedAt: fs.serverTimestamp() });
  }, []);

  const deleteProduct = useCallback(async (id) => {
    const { db, fs } = await loadFirestore();
    await fs.deleteDoc(fs.doc(db, COLLECTION, id));
  }, []);

  const value = useMemo(
    () => ({ products, loading, error, retry, getProductById, addProduct, updateProduct, deleteProduct }),
    [products, loading, error, retry, getProductById, addProduct, updateProduct, deleteProduct]
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used within a ProductsProvider');
  return ctx;
}
