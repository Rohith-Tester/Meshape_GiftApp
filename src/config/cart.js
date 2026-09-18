/**
 * Cart limits, kept here so the quantity cap is a single shared number
 * rather than a literal repeated in the stepper and the add-to-cart path.
 *
 * Fix (BUG-01): the stepper enforced max 20 but `addItem` did not, so
 * pressing "Add to Cart" repeatedly on a product page walked the quantity
 * straight past the cap — 22 was reachable in testing, at full price.
 */
export const MIN_CART_QUANTITY = 1;
export const MAX_CART_QUANTITY = 20;

/** Clamps any quantity into the allowed range. */
export function clampQuantity(quantity) {
  if (!Number.isFinite(quantity)) return MIN_CART_QUANTITY;
  return Math.min(MAX_CART_QUANTITY, Math.max(MIN_CART_QUANTITY, Math.round(quantity)));
}
