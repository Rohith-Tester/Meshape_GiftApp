import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../context/ProductsContext';
import { searchProducts } from '../../utils/search';
import { getOptimizedImageUrl } from '../../utils/cloudinaryImage';
import { ROUTES } from '../../config/routes';
import './SearchBar.css';

/**
 * Live, ranked autocomplete. Suggestions are recomputed from real product
 * metadata on every keystroke (see src/utils/search.js) — there is no
 * hardcoded list of queries or results anywhere in this component.
 */
export default function SearchBar({ variant = 'inline', onNavigate }) {
  const { products } = useProducts();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const suggestions = useMemo(() => searchProducts(products, query, { limit: 6 }), [products, query]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function goToProduct(product) {
    setQuery('');
    setOpen(false);
    navigate(ROUTES.productDetailPath(product.id));
    onNavigate?.();
  }

  function goToSearchResults() {
    if (!query.trim()) return;
    setOpen(false);
    navigate(`${ROUTES.products}?q=${encodeURIComponent(query.trim())}`);
    onNavigate?.();
  }

  function handleKeyDown(e) {
    if (!open || suggestions.length === 0) {
      if (e.key === 'Enter') goToSearchResults();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0) goToProduct(suggestions[activeIndex]);
      else goToSearchResults();
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div className={`search-bar search-bar--${variant}`} ref={containerRef}>
      <span className="search-bar__icon" aria-hidden="true">
        <SearchIcon />
      </span>
      <input
        type="search"
        className="search-bar__input"
        placeholder="Search personalized gifts…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => query && setOpen(true)}
        onKeyDown={handleKeyDown}
        aria-label="Search products"
        aria-expanded={open && suggestions.length > 0}
        aria-autocomplete="list"
        role="combobox"
      />

      {open && query && (
        <ul className="search-bar__suggestions" role="listbox">
          {suggestions.length === 0 && <li className="search-bar__empty">No gifts match “{query}”</li>}
          {suggestions.map((product, index) => (
            <li key={product.id} role="option" aria-selected={index === activeIndex}>
              <button
                type="button"
                className={`search-bar__suggestion ${index === activeIndex ? 'search-bar__suggestion--active' : ''}`}
                onMouseDown={() => goToProduct(product)}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <img src={getOptimizedImageUrl(product.images[0], { width: 80 })} alt="" className="search-bar__thumb" />
                <span>
                  <span className="search-bar__name">{product.name}</span>
                  <span className="search-bar__category">{product.category}</span>
                </span>
              </button>
            </li>
          ))}
          {suggestions.length > 0 && (
            <li>
              <button type="button" className="search-bar__view-all" onMouseDown={goToSearchResults}>
                See all results for “{query}”
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
      <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
