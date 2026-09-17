import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'meshape.cart.v1';

function readStoredCart() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
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
        return current.map((line) =>
          line.lineId === lineId ? { ...line, quantity: line.quantity + quantity } : line
        );
      }
      return [
        ...current,
        {
          lineId,
          productId: product.id,
          name: product.name,
          image: product.images[0],
          size: product.size || '',
          customizable: product.customizable,
          price: pricing.price,
          discountPercent: pricing.discountPercent,
          offerName: pricing.offerName,
          finalPrice: pricing.finalPrice,
          quantity,
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
        : current.map((line) => (line.lineId === lineId ? { ...line, quantity } : line))
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = useMemo(() => items.reduce((sum, line) => sum + line.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, line) => sum + line.finalPrice * line.quantity, 0), [items]);

  const value = useMemo(
    () => ({ items, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal }),
    [items, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
