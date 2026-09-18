import { useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductsContext';
import { useOffers } from '../context/OffersContext';
import { getProductPricing } from '../utils/pricing';

/**
 * Reconciles the stored cart against the live catalogue.
 *
 * The cart deliberately stores a snapshot of each line (name, image,
 * price, offer) so it survives a reload and works offline. What was
 * missing was ever checking that snapshot again:
 *
 *  - BUG-04: an offer could end while items sat in the cart, and the
 *    order still went out at the old discounted price.
 *  - NEW-02: a product could be deleted entirely and the line stayed
 *    fully orderable.
 *  - NEW-03: a product could be marked unavailable and still be ordered
 *    from an existing cart.
 *
 * Each line comes back tagged with a `status` so the UI can show the
 * customer what changed and settle it before they order:
 *   'ok'          — matches the catalogue
 *   'repriced'    — still for sale, but at a different price now
 *   'unavailable' — exists but is no longer for sale
 *   'removed'     — no longer in the catalogue at all
 *
 * While the catalogue is still loading every line is reported as 'ok',
 * so a slow connection never flashes "this item was removed".
 */
export function useCartLines() {
  const { items } = useCart();
  const { products, loading } = useProducts();
  const { offers } = useOffers();

  return useMemo(() => {
    return items.map((line) => {
      if (loading) return { ...line, status: 'ok', currentPrice: line.finalPrice, pricing: null };

      const product = products.find((p) => p.id === line.productId);
      if (!product) {
        return { ...line, status: 'removed', currentPrice: line.finalPrice, pricing: null };
      }
      if (!product.available) {
        return { ...line, status: 'unavailable', currentPrice: line.finalPrice, pricing: null };
      }

      const pricing = getProductPricing(product, offers);
      const repriced = pricing.finalPrice !== line.finalPrice;

      return {
        ...line,
        // Name and image are refreshed too, so an edited product doesn't
        // sit in the cart under its old name.
        name: product.name,
        image: product.images?.[0] || line.image,
        size: product.size || '',
        status: repriced ? 'repriced' : 'ok',
        currentPrice: pricing.finalPrice,
        pricing,
      };
    });
  }, [items, products, offers, loading]);
}

/**
 * True when a line can still be bought. A repriced line counts: the gift
 * is on sale, just at a different price than when it was added, so it
 * belongs in the total at `currentPrice`. Only a product that has gone
 * away or been taken off sale is genuinely unbuyable.
 */
export function isOrderable(line) {
  return line.status === 'ok' || line.status === 'repriced';
}

/** Human wording for why a line needs the customer's attention. */
export function describeLineChange(line) {
  switch (line.status) {
    case 'removed':
      return 'is no longer in our catalogue.';
    case 'unavailable':
      return 'is currently unavailable.';
    case 'repriced':
      return 'has changed price since you added it.';
    default:
      return '';
  }
}

/**
 * Summary of a reconciled cart: the total the customer would actually
 * pay today, and whether anything needs their attention first.
 *
 * `subtotal` always reflects today's real prices, so the figure on
 * screen is never the stale one. `needsReview` is what gates checkout —
 * the customer must see and accept any change before ordering.
 */
export function summarizeCartLines(lines) {
  const orderable = lines.filter(isOrderable);
  const unbuyable = lines.filter((l) => l.status === 'removed' || l.status === 'unavailable');
  const repriced = lines.filter((l) => l.status === 'repriced');
  const changed = [...unbuyable, ...repriced];

  return {
    orderable,
    unbuyable,
    repriced,
    changed,
    needsReview: changed.length > 0,
    // Kept for callers that only care whether checkout is blocked.
    hasProblems: changed.length > 0,
    subtotal: orderable.reduce((sum, l) => sum + l.currentPrice * l.quantity, 0),
    totalItems: orderable.reduce((sum, l) => sum + l.quantity, 0),
  };
}
