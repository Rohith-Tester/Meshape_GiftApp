import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ROUTES } from '../../config/routes';
import { formatINR } from '../../utils/currency';
import { getProductPricing } from '../../utils/pricing';
import { getOptimizedImageUrl } from '../../utils/cloudinaryImage';
import { useOffers } from '../../context/OffersContext';
import { useWishlist } from '../../context/WishlistContext';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { offers } = useOffers();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [justToggled, setJustToggled] = useState(false);
  const pricing = getProductPricing(product, offers);
  const wishlisted = isWishlisted(product.id);

  function handleWishlistClick(e) {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    setJustToggled(true);
    setTimeout(() => setJustToggled(false), 320);
  }

  return (
    <article className="product-card">
      <Link to={ROUTES.productDetailPath(product.id)} className="product-card__media">
        <img src={getOptimizedImageUrl(product.images[0], { width: 500 })} alt={product.name} loading="lazy" />
        {pricing.hasOffer && <span className="product-card__badge">{pricing.discountPercent}% OFF</span>}
        {product.size && <span className="product-card__size-badge">{product.size}</span>}
        <button
          type="button"
          className={`product-card__wishlist ${wishlisted ? 'product-card__wishlist--active' : ''} ${
            justToggled ? 'product-card__wishlist--pop' : ''
          }`}
          onClick={handleWishlistClick}
          aria-pressed={wishlisted}
          aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        >
          <HeartIcon filled={wishlisted} />
        </button>
      </Link>

      <div className="product-card__body">
        <div className="product-card__category-row">
          <p className="product-card__category">{product.category}</p>
          {product.instagramUrl && (
            <a
              href={product.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="product-card__instagram"
              onClick={(e) => e.stopPropagation()}
              aria-label={`View ${product.name} on Instagram`}
            >
              <InstagramIcon />
            </a>
          )}
        </div>
        <Link to={ROUTES.productDetailPath(product.id)} className="product-card__name">
          {product.name}
        </Link>

        <div className="product-card__price-row">
          <span className="product-card__price">{formatINR(pricing.finalPrice)}</span>
          {pricing.hasOffer && <span className="product-card__price-original">{formatINR(pricing.price)}</span>}
        </div>

        <button
          type="button"
          className="product-card__view-btn"
          onClick={() => navigate(ROUTES.productDetailPath(product.id))}
        >
          View Details
        </button>
      </div>
    </article>
  );
}

function InstagramIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.3" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" />
    </svg>
  );
}

function HeartIcon({ filled }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} aria-hidden="true">
      <path
        d="M12 20s-7.2-4.35-9.6-9.06C.86 7.86 2.4 4.5 5.7 4.02c2-.3 3.86.63 4.8 2.34a4.66 4.66 0 0 1 1.5-1.8c1.6-1.2 3.9-1.02 5.4.6 1.9 2.04 1.66 5.1-.3 7.8C15.3 15.7 12 20 12 20z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
