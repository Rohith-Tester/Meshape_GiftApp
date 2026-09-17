import { Link } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext';
import { useOffers } from '../context/OffersContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { getProductPricing } from '../utils/pricing';
import { formatINR } from '../utils/currency';
import { getOptimizedImageUrl } from '../utils/cloudinaryImage';
import EmptyState from '../components/ui/EmptyState';
import DataLoadError from '../components/ui/DataLoadError';
import { ROUTES } from '../config/routes';
import { useDocumentHead } from '../hooks/useDocumentHead';
import './Wishlist.css';

export default function Wishlist() {
  useDocumentHead({
    title: 'Your Wishlist',
    description: 'Gifts you have saved to come back to later.',
    noindex: true,
  });

  const { products, error: productsError } = useProducts();
  const { offers } = useOffers();
  const { wishlistIds, removeFromWishlist } = useWishlist();
  const { addItem } = useCart();

  const wishlistProducts = wishlistIds
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean);

  function handleMoveToCart(product) {
    const pricing = getProductPricing(product, offers);
    addItem(product, pricing, 1, null);
    removeFromWishlist(product.id);
  }

  // Phase 10 QA fix: previously, if the product catalogue failed to
  // load, a customer with genuinely saved wishlist items would see "your
  // wishlist is empty" — indistinguishable from actually having nothing
  // saved. Checking wishlistIds directly (not the resolved products)
  // catches this case correctly.
  if (wishlistIds.length > 0 && productsError) {
    return (
      <div className="section">
        <div className="container">
          <DataLoadError message="We're having trouble loading your saved gifts." />
        </div>
      </div>
    );
  }

  if (wishlistProducts.length === 0) {
    return (
      <div className="section">
        <div className="container">
          <EmptyState
            icon={<HeartOutlineIcon />}
            title="Your wishlist is empty"
            description="Save gifts you like while browsing and they'll show up here."
            actionLabel="Browse All Gifts"
            actionTo={ROUTES.products}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container">
        <h1>Your Wishlist</h1>
        <div className="wishlist-list">
          {wishlistProducts.map((product) => {
            const pricing = getProductPricing(product, offers);
            return (
              <div className="wishlist-item" key={product.id}>
                <Link to={ROUTES.productDetailPath(product.id)} className="wishlist-item__media">
                  <img src={getOptimizedImageUrl(product.images[0], { width: 200 })} alt={product.name} />
                </Link>
                <div className="wishlist-item__info">
                  <Link to={ROUTES.productDetailPath(product.id)} className="wishlist-item__name">
                    {product.name}
                  </Link>
                  <p className="wishlist-item__category">{product.category}</p>
                  <div className="wishlist-item__price-row">
                    <span className="wishlist-item__price">{formatINR(pricing.finalPrice)}</span>
                    {pricing.hasOffer && (
                      <span className="wishlist-item__price-original">{formatINR(pricing.price)}</span>
                    )}
                  </div>
                </div>
                <div className="wishlist-item__actions">
                  <button type="button" className="wishlist-item__move" onClick={() => handleMoveToCart(product)}>
                    Move to Cart
                  </button>
                  <button
                    type="button"
                    className="wishlist-item__remove"
                    onClick={() => removeFromWishlist(product.id)}
                    aria-label={`Remove ${product.name} from wishlist`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function HeartOutlineIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 20s-7.2-4.35-9.6-9.06C.86 7.86 2.4 4.5 5.7 4.02c2-.3 3.86.63 4.8 2.34a4.66 4.66 0 0 1 1.5-1.8c1.6-1.2 3.9-1.02 5.4.6 1.9 2.04 1.66 5.1-.3 7.8C15.3 15.7 12 20 12 20z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
