/**
 * Categories are never maintained as a separate hardcoded list — they are
 * derived from whatever products actually exist, so adding a product in a
 * new category (via Admin, in Phase 6) automatically surfaces it here.
 */
export function getCategories(products) {
  const map = new Map();

  for (const product of products) {
    if (!product.available) continue;
    if (!map.has(product.category)) {
      map.set(product.category, {
        name: product.category,
        image: product.images[0],
        count: 0,
      });
    }
    map.get(product.category).count += 1;
  }

  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}
