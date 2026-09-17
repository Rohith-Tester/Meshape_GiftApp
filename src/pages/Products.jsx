import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductFilters, { PRICE_RANGES } from '../components/product/ProductFilters';
import ProductGrid from '../components/product/ProductGrid';
import EmptyState from '../components/ui/EmptyState';
import DataLoadError from '../components/ui/DataLoadError';
import { useProducts } from '../context/ProductsContext';
import { useOffers } from '../context/OffersContext';
import { getCategories } from '../utils/categories';
import { searchProducts } from '../utils/search';
import { getActiveOfferForProduct } from '../utils/pricing';
import { useDocumentHead } from '../hooks/useDocumentHead';

function parsePriceRange(value) {
  if (value === 'all') return null;
  const [min, max] = value.split('-').map(Number);
  return { min, max };
}

// Phase 10 QA fix: previously both bounds were inclusive
// (price >= min and price <= max) for every tier, which meant a product
// priced at exactly a boundary (₹300, ₹600, ₹1,000) would silently match
// two tiers at once. None of the current demo products happen to sit on
// a boundary, so this never showed up — but it would as soon as a real
// product was priced at a round number. Every tier now includes its
// min and excludes its max, so they partition cleanly, except the last
// tier (no upper bound), which includes everything from its min upward.
function isInPriceRange(price, range, isLastTier) {
  if (price < range.min) return false;
  return isLastTier ? true : price < range.max;
}

export default function Products() {
  const { products, error: productsError } = useProducts();
  const { offers } = useOffers();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  // Phase 10 QA fix: `category` used to be its own useState, seeded from
  // the URL only once on mount. Since `query` is already read live from
  // searchParams on every render, but `category` wasn't, the two could
  // silently desync: clicking a category chip updated both the URL and
  // this state together, but the browser Back/Forward buttons only
  // change the URL — without a page navigation (staying on /products the
  // whole time), React Router re-renders this same component instance
  // rather than remounting it, so the stale `category` state never
  // noticed the URL had changed back. The filter chip and product list
  // would silently stop responding to Back/Forward. Reading `category`
  // directly from searchParams on every render (like `query` already
  // did) makes the URL the single source of truth, so this can't desync.
  const category = searchParams.get('category') || 'all';
  const [offerOnly, setOfferOnly] = useState(false);
  const [priceRange, setPriceRange] = useState('all');
  const [sort, setSort] = useState('featured');

  useDocumentHead({
    title: query ? `Results for "${query}"` : 'Shop All Gifts',
    description:
      'Browse personalized mugs, lamps, keychains, cushions, hampers and gift combos — filter by category, price and offers.',
  });

  const categories = useMemo(() => getCategories(products), [products]);

  const filtered = useMemo(() => {
    let list = query ? searchProducts(products, query, { limit: 100 }) : products.filter((p) => p.available);

    if (category !== 'all') {
      list = list.filter((p) => p.category === category);
    }

    if (offerOnly) {
      list = list.filter((p) => getActiveOfferForProduct(p, offers));
    }

    const range = parsePriceRange(priceRange);
    if (range) {
      const isLastTier = PRICE_RANGES[PRICE_RANGES.length - 1].value === priceRange;
      list = list.filter((p) => isInPriceRange(p.price, range, isLastTier));
    }

    const sorted = [...list];
    if (sort === 'price-asc') sorted.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') sorted.sort((a, b) => b.price - a.price);
    else if (sort === 'name-asc') sorted.sort((a, b) => a.name.localeCompare(b.name));

    return sorted;
  }, [products, offers, query, category, offerOnly, priceRange, sort]);

  function handleCategoryChange(value) {
    const next = new URLSearchParams(searchParams);
    if (value === 'all') next.delete('category');
    else next.set('category', value);
    setSearchParams(next, { replace: true });
  }

  return (
    <div className="section">
      <div className="container">
        <h1>{query ? `Results for "${query}"` : 'Shop All Gifts'}</h1>

        {productsError && <DataLoadError message="We're having trouble loading the gift catalogue." />}

        <ProductFilters
          categories={categories}
          category={category}
          onCategoryChange={handleCategoryChange}
          offerOnly={offerOnly}
          onOfferOnlyChange={setOfferOnly}
          priceRange={priceRange}
          onPriceRangeChange={setPriceRange}
          sort={sort}
          onSortChange={setSort}
          resultCount={filtered.length}
        />

        {filtered.length > 0 ? (
          <ProductGrid products={filtered} />
        ) : (
          !productsError && (
            <EmptyState
              title="No gifts match your search"
              description="Try a different keyword, or clear your filters to see everything we have."
              actionLabel="Clear Filters"
              onAction={() => {
                setOfferOnly(false);
                setPriceRange('all');
                setSearchParams({}, { replace: true });
              }}
            />
          )
        )}
      </div>
    </div>
  );
}
