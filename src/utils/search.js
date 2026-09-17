/**
 * Smart search / autocomplete. Every suggestion is derived live from real
 * product metadata (name, category, tags, keywords, description) — never
 * a hardcoded lookup table, per Master Specification section 11.
 *
 * Ranking (highest priority first):
 *   1. Exact product name match
 *   2. Product name starts with query
 *   3. Product name contains query
 *   4. Category matches/contains query
 *   5. Tags or keywords contain query
 *   6. Description contains query
 */

const RANK = {
  EXACT_NAME: 6,
  NAME_STARTS_WITH: 5,
  NAME_CONTAINS: 4,
  CATEGORY: 3,
  TAGS_KEYWORDS: 2,
  DESCRIPTION: 1,
};

function normalize(value) {
  return value.trim().toLowerCase();
}

function scoreProduct(product, query) {
  const q = normalize(query);
  const name = normalize(product.name);

  if (name === q) return RANK.EXACT_NAME;
  if (name.startsWith(q)) return RANK.NAME_STARTS_WITH;
  if (name.includes(q)) return RANK.NAME_CONTAINS;
  if (normalize(product.category).includes(q)) return RANK.CATEGORY;

  const tagsAndKeywords = [...(product.tags || []), ...(product.keywords || [])].map(normalize);
  if (tagsAndKeywords.some((t) => t.includes(q))) return RANK.TAGS_KEYWORDS;

  if (normalize(product.description || '').includes(q)) return RANK.DESCRIPTION;

  return 0;
}

/**
 * Returns matching products ranked by relevance, most relevant first.
 * Only available products are returned. `limit` caps result count.
 */
export function searchProducts(products, query, { limit = 8, includeUnavailable = false } = {}) {
  const q = normalize(query || '');
  if (!q) return [];

  return products
    .filter((p) => includeUnavailable || p.available)
    .map((p) => ({ product: p, score: scoreProduct(p, q) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name))
    .slice(0, limit)
    .map((entry) => entry.product);
}
