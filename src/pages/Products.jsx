import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductFilters, { PRICE_RANGES } from '../components/product/ProductFilters';
import ProductGrid from '../components/product/ProductGrid';
import EmptyState from '../components/ui/EmptyState';
import DataLoadError from '../components/ui/DataLoadError';
import { useProducts } from '../context/ProductsContext';
import { useOffers } from '../context/OffersContext';
import { getCategories } from '../utils/categories';
import { searchProducts } from '../utils/search';
import { getActiveOfferForProduct, getProductPricing } from '../utils/pricing';
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
  const { products, error: productsError, loading: productsLoading, retry: retryProducts } = useProducts();
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

  // Fix (NEW-10): price range, "On Offer" and sort used to be component
  // state, so a shared or reloaded filtered link silently dropped them
  // and Back/Forward didn't restore them — exactly the desync that was
  // already fixed for `category` (see the note above). All four filters
  // now read from the URL, which is the single source of truth.
  const priceRange = searchParams.get('price') || 'all';
  const sort = searchParams.get('sort') || 'featured';
  const offerOnly = searchParams.get('offer') === '1';

  const setParam = useCallback(
    (key, value, defaultValue) => {
      const next = new URLSearchParams(searchParams);
      if (value === defaultValue) next.delete(key);
      else next.set(key, value);
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  useDocumentHead({
    title: query ? `Results for "${query}"` : 'Shop All Gifts',
    description:
      'Browse personalized mugs, lamps, keychains, cushions, hampers and gift combos — filter by category, price and offers.',
  });

  const categories = useMemo(() => getCategories(products), [products]);

  // Fix (NEW-06): a category in the URL that no longer exists (a rename,
  // a stale link, or just the wrong capitalisation — categories are
  // matched exactly) produced "0 gifts found" while the dropdown still
  // read "All Categories", so the customer saw an empty shop with no
  // visible filter to clear. We now detect that and say so.
  const categoryIsKnown = category === 'all' || categories.some((c) => c.name === category);
  const effectiveCategory = categoryIsKnown ? category : 'all';

  const filtered = useMemo(() => {
    let list = query ? searchProducts(products, query, { limit: 100 }) : products.filter((p) => p.available);

    if (effectiveCategory !== 'all') {
      list = list.filter((p) => p.category === effectiveCategory);
    }

    if (offerOnly) {
      list = list.filter((p) => getActiveOfferForProduct(p, offers));
    }

    // Fix (BUG-07): price filtering and sorting both used `p.price`, the
    // ORIGINAL price, while the card showed the discounted one. With
    // overlapping offers the catalogue visibly listed ₹119, ₹179, ₹269,
    // ₹150 under "Price: Low to High" — the cheapest gift last. Both now
    // use the same final price the customer actually sees and pays.
    const priceOf = (p) => getProductPricing(p, offers).finalPrice;

    const range = parsePriceRange(priceRange);
    if (range) {
      const isLastTier = PRICE_RANGES[PRICE_RANGES.length - 1].value === priceRange;
      list = list.filter((p) => isInPriceRange(priceOf(p), range, isLastTier));
    }

    const sorted = [...list];
    if (sort === 'price-asc') sorted.sort((a, b) => priceOf(a) - priceOf(b));
    else if (sort === 'price-desc') sorted.sort((a, b) => priceOf(b) - priceOf(a));
    else if (sort === 'name-asc') sorted.sort((a, b) => a.name.localeCompare(b.name));

    return sorted;
  }, [products, offers, query, effectiveCategory, offerOnly, priceRange, sort]);

  function handleCategoryChange(value) {
    setParam('category', value, 'all');
  }

  return (
    <div className="section">
      <div className="container">
        <h1>{query ? `Results for "${query}"` : 'Shop All Gifts'}</h1>

        {productsError && <DataLoadError
            message="We're having trouble loading the gift catalogue."
            onRetry={retryProducts}
            retrying={productsLoading}
          />}

        {!categoryIsKnown && (
          <p className="products-page__unknown-category" role="status">
            We don’t have a category called “{category}” any more, so we’re showing everything instead.
          </p>
        )}

        <ProductFilters
          categories={categories}
          category={effectiveCategory}
          onCategoryChange={handleCategoryChange}
          offerOnly={offerOnly}
          onOfferOnlyChange={(v) => setParam('offer', v ? '1' : '0', '0')}
          priceRange={priceRange}
          onPriceRangeChange={(v) => setParam('price', v, 'all')}
          sort={sort}
          onSortChange={(v) => setParam('sort', v, 'featured')}
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
              onAction={() => setSearchParams({}, { replace: true })}
            />
          )
        )}
      </div>
    </div>
  );
}
