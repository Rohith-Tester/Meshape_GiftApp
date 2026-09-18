import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { PRIMARY_NAV_LINKS, ROUTES } from '../../config/routes';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import SearchBar from '../search/SearchBar';
import './Navbar.css';

/** "1 item" / "2 items" — used in the icon buttons' accessible labels. */
function pluralizeItems(count) {
  return `${count} ${count === 1 ? 'item' : 'items'}`;
}

/**
 * Translucent, blur-backed navbar. Solidifies slightly once the page is
 * scrolled so text stays legible over any hero content behind it.
 */
export default function Navbar() {
  const { wishlistIds } = useWishlist();
  const { totalItems } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile menu automatically if the viewport grows past mobile.
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 860) setMenuOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        <NavLink to={ROUTES.home} className="navbar__brand" onClick={() => setMenuOpen(false)}>
          <span className="navbar__brand-badge">
            <img src="/meshape-logo.png" alt="MeShape" className="navbar__brand-logo" />
          </span>
          <span className="navbar__brand-sub">Gift Shop</span>
        </NavLink>

        <nav className="navbar__links" aria-label="Primary">
          {PRIMARY_NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="navbar__search">
          <SearchBar variant="inline" />
        </div>

        <div className="navbar__actions">
          {/* Fix (BUG-22): these read "Wishlist, 1 items" — screen readers
              speak the label verbatim, so single-item states were
              announced ungrammatically. */}
          <NavLink
            to={ROUTES.wishlist}
            className="navbar__icon-btn"
            aria-label={`Wishlist, ${pluralizeItems(wishlistIds.length)}`}
          >
            <HeartIcon />
            {wishlistIds.length > 0 && <span className="navbar__badge">{wishlistIds.length}</span>}
          </NavLink>
          <NavLink to={ROUTES.cart} className="navbar__icon-btn" aria-label={`Cart, ${pluralizeItems(totalItems)}`}>
            <BagIcon />
            {totalItems > 0 && <span className="navbar__badge">{totalItems}</span>}
          </NavLink>
          <button
            type="button"
            className="navbar__menu-toggle"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className={`navbar__burger ${menuOpen ? 'navbar__burger--open' : ''}`} />
          </button>
        </div>
      </div>

      <div className={`navbar__mobile-panel ${menuOpen ? 'navbar__mobile-panel--open' : ''}`}>
        <div className="navbar__mobile-search">
          <SearchBar variant="inline" onNavigate={() => setMenuOpen(false)} />
        </div>
        <nav className="navbar__mobile-links" aria-label="Mobile">
          {PRIMARY_NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 20s-7.2-4.35-9.6-9.06C.86 7.86 2.4 4.5 5.7 4.02c2-.3 3.86.63 4.8 2.34a4.66 4.66 0 0 1 1.5-1.8c1.6-1.2 3.9-1.02 5.4.6 1.9 2.04 1.66 5.1-.3 7.8C15.3 15.7 12 20 12 20z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 9V7a6 6 0 0 1 12 0v2M4.5 9h15l-1 11.5a1.5 1.5 0 0 1-1.5 1.4H7a1.5 1.5 0 0 1-1.5-1.4L4.5 9z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
