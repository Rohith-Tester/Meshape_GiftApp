/**
 * Demo offers. Each offer targets a specific product, an entire category,
 * or all products — never applied globally unless explicitly configured
 * here, matching Master Specification section 27.
 *
 * `appliesTo`: 'product' | 'category' | 'all'
 * `targetId`: a product id (when appliesTo is 'product'), a category name
 *              (when appliesTo is 'category'), or omitted for 'all'.
 *
 * Dates are ISO strings so this can be swapped for real Admin-managed data
 * in Phase 7 without changing the pricing logic in src/utils/pricing.js.
 */

export const offers = [
  {
    id: 'teachers-day-mugs',
    name: 'Teachers Day Special',
    discountPercent: 20,
    appliesTo: 'category',
    targetId: 'Mugs',
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    active: true,
  },
  {
    id: 'teddy-special',
    name: 'Teddy Special',
    discountPercent: 15,
    appliesTo: 'product',
    targetId: 'teddy-bear-gift',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    active: true,
  },
  {
    id: 'festival-sale',
    name: 'Festival Sale',
    discountPercent: 10,
    appliesTo: 'all',
    targetId: null,
    startDate: '2026-08-15',
    endDate: '2026-11-15',
    active: true,
  },
];

export default offers;
