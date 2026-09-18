/**
 * Renders a URL that came from the database, not from this codebase.
 *
 * WHY THIS EXISTS (security audit 2026-09-18, finding SEC-04)
 * -----------------------------------------------------------
 * `product.instagramUrl` is written by an admin and then rendered
 * straight into an `<a href>` on ProductCard and ProductDetail. React
 * escapes text, but it does NOT sanitize href values — a stored value of
 * `javascript:...` renders as a working javascript: link and executes in
 * the visitor's page when clicked. The same is true of `data:text/html`.
 *
 * ProductForm already refuses anything that doesn't start with http(s),
 * but that check lives in the browser, in the form. It is not the only
 * way a value reaches Firestore: an admin using the Firestore console,
 * a direct REST call with an admin token, or a future import script all
 * bypass it entirely. This guard sits at the render, which every path
 * goes through, so it holds regardless of how the value was written.
 *
 * This is defence in depth, not a patch for an active hole — writing a
 * product already requires a verified `admin` custom claim
 * (firestore.rules). It removes the case where one compromised or
 * careless admin write turns into script execution in every visitor's
 * browser.
 */

const SAFE_PROTOCOLS = ['http:', 'https:'];

/**
 * Returns the URL unchanged if it is a well-formed http(s) URL, and
 * `null` otherwise. Callers render the link only when this is non-null,
 * so a rejected value degrades to "no link" rather than a broken or
 * dangerous one.
 *
 * Relative URLs ("/products") are rejected on purpose: every caller here
 * renders an EXTERNAL link, and `new URL()` cannot resolve a relative
 * path without a base anyway.
 */
export function safeExternalUrl(value) {
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  return SAFE_PROTOCOLS.includes(parsed.protocol) ? trimmed : null;
}

/**
 * The same guard for image sources. An `<img src>` cannot execute
 * script, so this is a smaller risk than an href — but a stored
 * `data:` URL can still carry an arbitrary payload, and rejecting
 * anything that isn't http(s) keeps what the storefront loads
 * predictable and CSP-compatible.
 *
 * Unlike safeExternalUrl this allows a same-origin relative path,
 * because the demo catalogue in src/data/products.js references local
 * files that way.
 */
export function safeImageUrl(value) {
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  // A root-relative path from the app's own bundled demo data.
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return trimmed;

  return safeExternalUrl(trimmed);
}
