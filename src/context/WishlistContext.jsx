import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const WishlistContext = createContext(null);
const STORAGE_KEY = 'meshape.wishlist.v1';

function readStoredWishlist() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Persists wishlist product ids to localStorage. This is DEMO-MODE
 * storage — fine for a single browser/device today. Phase 8 (backend)
 * can swap this provider's internals for a per-customer-account API call
 * without changing the hook's public shape (`useWishlist()`), so no
 * consuming component needs to change.
 */
export function WishlistProvider({ children }) {
  const [wishlistIds, setWishlistIds] = useState(readStoredWishlist);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlistIds));
    } catch {
      // Storage can fail (private browsing, quota) — wishlist still works
      // for the current session, it just won't persist across reloads.
    }
  }, [wishlistIds]);

  const isWishlisted = useCallback((productId) => wishlistIds.includes(productId), [wishlistIds]);

  const addToWishlist = useCallback((productId) => {
    setWishlistIds((ids) => (ids.includes(productId) ? ids : [...ids, productId]));
  }, []);

  const removeFromWishlist = useCallback((productId) => {
    setWishlistIds((ids) => ids.filter((id) => id !== productId));
  }, []);

  const toggleWishlist = useCallback((productId) => {
    setWishlistIds((ids) => (ids.includes(productId) ? ids.filter((id) => id !== productId) : [...ids, productId]));
  }, []);

  const value = useMemo(
    () => ({ wishlistIds, isWishlisted, addToWishlist, removeFromWishlist, toggleWishlist }),
    [wishlistIds, isWishlisted, addToWishlist, removeFromWishlist, toggleWishlist]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within a WishlistProvider');
  return ctx;
}
