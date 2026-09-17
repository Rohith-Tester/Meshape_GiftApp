import './ProductFilters.css';

export const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A–Z' },
];

export const PRICE_RANGES = [
  { value: 'all', label: 'Any Price' },
  { value: '0-300', label: 'Under ₹300' },
  { value: '300-600', label: '₹300 – ₹600' },
  { value: '600-1000', label: '₹600 – ₹1,000' },
  { value: '1000-100000', label: 'Above ₹1,000' },
];

export default function ProductFilters({
  categories,
  category,
  onCategoryChange,
  offerOnly,
  onOfferOnlyChange,
  priceRange,
  onPriceRangeChange,
  sort,
  onSortChange,
  resultCount,
}) {
  return (
    <div className="product-filters">
      <div className="product-filters__row">
        <select
          className="product-filters__select"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          aria-label="Filter by category"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          className="product-filters__select"
          value={priceRange}
          onChange={(e) => onPriceRangeChange(e.target.value)}
          aria-label="Filter by price"
        >
          {PRICE_RANGES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>

        <label className="product-filters__checkbox">
          <input type="checkbox" checked={offerOnly} onChange={(e) => onOfferOnlyChange(e.target.checked)} />
          On Offer
        </label>

        <select
          className="product-filters__select product-filters__select--sort"
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          aria-label="Sort products"
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              Sort: {s.label}
            </option>
          ))}
        </select>
      </div>

      <p className="product-filters__count">{resultCount} gift{resultCount !== 1 ? 's' : ''} found</p>
    </div>
  );
}
