import { safeImageUrl } from './safeUrl';

/**
 * Safe access to a product's primary image.
 *
 * Fix (NEW-17): five call sites indexed `product.images[0]` directly.
 * The admin form requires at least one image, but the Firestore rules
 * do not validate document contents (NEW-20), so a product written by
 * any other route — a script, the console, a future import — can carry
 * an empty or missing images array. That would render <img src={undefined}>
 * or throw outright on a page the customer is looking at.
 *
 * The placeholder is the shop's own logo, which already ships in
 * public/, so a missing photo degrades to branding rather than a broken
 * image icon.
 */
export const PRODUCT_IMAGE_PLACEHOLDER = '/meshape-logo.png';

/**
 * Security audit 2026-09-18 (SEC-04): every stored image URL now passes
 * through safeImageUrl first. Firestore rules can enforce that `images`
 * is a non-empty list, but rules have no loop construct, so they cannot
 * check what each ENTRY of that list contains — a `data:` or
 * `javascript:` string in there reaches the browser untouched. These two
 * functions are the single chokepoint every product image render goes
 * through, so the check belongs here; a rejected URL degrades to the
 * shop logo, exactly as a missing one already did.
 */
export function getPrimaryImage(product) {
  return safeImageUrl(product?.images?.[0]) || PRODUCT_IMAGE_PLACEHOLDER;
}

/** Always returns an array, so `.map` and `.length` are safe. */
export function getProductImages(product) {
  const raw = Array.isArray(product?.images) ? product.images : [];
  const images = raw.map(safeImageUrl).filter(Boolean);
  return images.length > 0 ? images : [PRODUCT_IMAGE_PLACEHOLDER];
}
