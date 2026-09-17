/**
 * Related products, scored by genuine shared attributes — never random —
 * per Master Specification section 12.
 */

const WEIGHTS = {
  sameCategory: 5,
  sameProductType: 3,
  perSharedTag: 1,
  perSharedKeyword: 1,
  perSharedGiftingPurpose: 2,
};

function overlapCount(a = [], b = []) {
  const setB = new Set(b.map((v) => v.toLowerCase()));
  return a.filter((v) => setB.has(v.toLowerCase())).length;
}

function scoreRelated(base, candidate) {
  let score = 0;
  if (candidate.category === base.category) score += WEIGHTS.sameCategory;
  if (candidate.productType === base.productType) score += WEIGHTS.sameProductType;
  score += overlapCount(base.tags, candidate.tags) * WEIGHTS.perSharedTag;
  score += overlapCount(base.keywords, candidate.keywords) * WEIGHTS.perSharedKeyword;
  score += overlapCount(base.giftingPurpose, candidate.giftingPurpose) * WEIGHTS.perSharedGiftingPurpose;
  return score;
}

/**
 * Returns up to `limit` products genuinely related to `product`, ranked by
 * relevance. Products with a score of 0 (nothing in common) are excluded
 * rather than padded in, so results are never unrelated filler.
 */
export function getRelatedProducts(product, allProducts, { limit = 4 } = {}) {
  return allProducts
    .filter((p) => p.id !== product.id && p.available)
    .map((p) => ({ product: p, score: scoreRelated(product, p) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.product);
}
