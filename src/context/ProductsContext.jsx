import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

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

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, COLLECTION),
      (snapshot) => {
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
    return unsubscribe;
  }, []);

  const getProductById = useCallback((id) => products.find((p) => p.id === id) || null, [products]);

  const addProduct = useCallback(
    async (data) => {
      let id = slugify(data.name);
      let suffix = 2;
      while (products.some((p) => p.id === id)) {
        id = `${slugify(data.name)}-${suffix}`;
        suffix += 1;
      }
      await setDoc(doc(db, COLLECTION, id), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return id;
    },
    [products]
  );

  const updateProduct = useCallback(async (id, updates) => {
    await updateDoc(doc(db, COLLECTION, id), { ...updates, updatedAt: serverTimestamp() });
  }, []);

  const deleteProduct = useCallback(async (id) => {
    await deleteDoc(doc(db, COLLECTION, id));
  }, []);

  const value = useMemo(
    () => ({ products, loading, error, getProductById, addProduct, updateProduct, deleteProduct }),
    [products, loading, error, getProductById, addProduct, updateProduct, deleteProduct]
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used within a ProductsProvider');
  return ctx;
}
