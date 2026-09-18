import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { MAX_CART_QUANTITY, clampQuantity } from '../config/cart';

const CartContext = createContext(null);
const STORAGE_KEY = 'meshape.cart.v1';

/**
 * Security audit 2026-09-18 (SEC-07): JSON.parse was trusted to return
 * an array. localStorage is writable by anything running on this origin
 * — a browser extension, a devtools paste, or a stale value from an
 * older build — and a stored `{}` or `"x"` parses fine, then blows up on
 * the first `.filter`/`.map` in the provider below. The result is a
 * blank page the customer cannot recover from by reloading, because the
 * bad value is read again every time.
 *
 * Not an externally exploitable hole (an attacker who can already write
 * this origin's localStorage has script execution and does not need it)
 * — but it is a self-inflicted denial of service with a trivial guard,
 * and it makes the crash recoverable: an unusable value is discarded and
 * overwritten on the next cart change.
 */
function readStoredCart() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Every consumer expects an array of line objects.
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((line) => line && typeof line === 'object');
  } catch {
    return [];
  }
}

/**
 * A cart line's identity is its product id plus a stable signature of its
 * customization (so "Mug — no customization" and "Mug — photo A" are
 * separate lines, but adding the same product with the same
 * customization twice increases quantity instead of duplicating a line).
 * Customization is always null in Phase 2; Phase 3 populates it.
 */
function getLineId(productId, customization) {
  if (!customization) return productId;
  return `${productId}::${JSON.stringify(customization)}`;
}

/**
 * DEMO-MODE storage via localStorage, same caveat as WishlistContext:
 * Phase 8 can back this with a real per-customer cart API without
 * changing the `useCart()` shape consumed by components.
 */
export function CartProvider({ children }) {
  const [items, setItems] = useState(readStoredCart);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Non-fatal — cart still works for the current session.
    }
  }, [items]);

  /**
   * pricing snapshot ({ price, finalPrice, discountPercent, offerName })
   * is computed by the caller at add-time via getProductPricing(), so the
   * cart shows the price the customer actually saw when they added it.
   */
  const addItem = useCallback((product, pricing, quantity = 1, customization = null) => {
    const lineId = getLineId(product.id, customization);

    setItems((current) => {
      const existing = current.find((line) => line.lineId === lineId);
      if (existing) {
        // Fix (BUG-01): clamp here too. Without this the cap only existed
        // in the stepper UI, so repeated "Add to Cart" presses on the
        // product page could push a line well past MAX_CART_QUANTITY.
        return current.map((line) =>
          line.lineId === lineId
            ? { ...line, quantity: clampQuantity(line.quantity + quantity) }
            : line
        );
      }
      return [
        ...current,
        {
          lineId,
          productId: product.id,
          name: product.name,
          image: product.images?.[0] || '',
          size: product.size || '',
          customizable: product.customizable,
          price: pricing.price,
          discountPercent: pricing.discountPercent,
          offerName: pricing.offerName,
          finalPrice: pricing.finalPrice,
          quantity: clampQuantity(quantity),
          customization,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((lineId) => {
    setItems((current) => current.filter((line) => line.lineId !== lineId));
  }, []);

  const updateQuantity = useCallback((lineId, quantity) => {
    setItems((current) =>
      quantity <= 0
        ? current.filter((line) => line.lineId !== lineId)
        : current.map((line) =>
            line.lineId === lineId ? { ...line, quantity: clampQuantity(quantity) } : line
          )
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  /**
   * Fix (BUG-04 / NEW-02): re-prices a line against the live catalogue
   * once the customer has been shown the change, so an order is never
   * sent at a price the shop no longer offers.
   */
  const repriceLine = useCallback((lineId, pricing) => {
    setItems((current) =>
      current.map((line) =>
        line.lineId === lineId
          ? {
              ...line,
              price: pricing.price,
              discountPercent: pricing.discountPercent,
              offerName: pricing.offerName,
              finalPrice: pricing.finalPrice,
            }
          : line
      )
    );
  }, []);

  /** Drops lines whose product no longer exists or is no longer for sale. */
  const removeLines = useCallback((lineIds) => {
    const doomed = new Set(lineIds);
    setItems((current) => current.filter((line) => !doomed.has(line.lineId)));
  }, []);

  const totalItems = useMemo(() => items.reduce((sum, line) => sum + line.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, line) => sum + line.finalPrice * line.quantity, 0), [items]);

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      removeLines,
      updateQuantity,
      repriceLine,
      clearCart,
      totalItems,
      subtotal,
      maxQuantity: MAX_CART_QUANTITY,
    }),
    [items, addItem, removeItem, removeLines, updateQuantity, repriceLine, clearCart, totalItems, subtotal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
