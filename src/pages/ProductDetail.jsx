import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import ProductGallery from '../components/product/ProductGallery';
import RelatedProducts from '../components/product/RelatedProducts';
import CustomizationModal from '../components/product/CustomizationModal';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import { useProducts } from '../context/ProductsContext';
import { useOffers } from '../context/OffersContext';
import { getProductPricing } from '../utils/pricing';
import { getRelatedProducts } from '../utils/relatedProducts';
import { formatINR } from '../utils/currency';
import { getProductImages } from '../utils/productImage';
import { safeExternalUrl } from '../utils/safeUrl';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { ROUTES } from '../config/routes';
import { useDocumentHead } from '../hooks/useDocumentHead';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, loading: productsLoading, error: productsError } = useProducts();
  const { offers } = useOffers();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const [addedMessage, setAddedMessage] = useState('');
  // 'cart' or 'order' — remembers which button opened the customization
  // modal so the right thing happens once the customer confirms it.
  const [pendingAction, setPendingAction] = useState(null);

  const product = products.find((p) => p.id === id);
  const related = useMemo(() => (product ? getRelatedProducts(product, products) : []), [product, products]);

  // Called unconditionally (hooks can't follow an early return) — falls
  // back to a generic title/description when the product isn't found.
  // A product with no description of its own still deserves a sensible,
  // product-specific one rather than the site-wide default (BUG-08).
  useDocumentHead({
    title: product ? product.name : 'Product Not Found',
    description: product
      ? product.description?.trim() ||
        `${product.name} — a personalized ${product.category} gift from MeShape Gift Shop, ready for pickup or delivery across India.`
      : 'This product could not be found.',
  });

  // Bug fix: /product/:id matches the same route for every product, so
  // React Router re-renders this component in place rather than
  // remounting it when navigating between two different products (e.g.
  // clicking a "You Might Also Like" card). Without this, the browser
  // keeps whatever scroll position it had — landing the customer
  // mid-page on the new product instead of at its top, making it look
  // like nothing actually opened.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Adds a class only while a product page is open, so the mobile
  // sticky Add to Cart / Order Now bar (see ProductDetail.css) can push
  // the floating WhatsApp bubble up out of its way — without changing
  // that bubble's position on every other page.
  useEffect(() => {
    document.body.classList.add('has-sticky-product-actions');
    return () => document.body.classList.remove('has-sticky-product-actions');
  }, []);

  // Phase 10 QA fix: a genuine connection failure previously looked
  // identical to "this product doesn't exist" — a customer whose
  // Firestore request failed would see "we couldn't find that gift" and
  // likely conclude the link was broken, when actually nothing could be
  // loaded at all. Distinguishing the two cases here, and also waiting
  // for the initial load to finish before concluding "not found" (so a
  // slow-but-working connection doesn't flash a false 404 on refresh).
  if (productsError) {
    return (
      <EmptyState
        title="We're having trouble loading this page"
        description="There may be a connection issue. Please refresh, or check back in a moment."
        actionLabel="Browse All Gifts"
        actionTo={ROUTES.products}
      />
    );
  }

  if (!product) {
    if (productsLoading) {
      return <p className="product-detail__loading">Loading…</p>;
    }
    return (
      <EmptyState
        title="We couldn't find that gift"
        description="It may have been removed or the link is incorrect. Take a look at everything else we have."
        actionLabel="Browse All Gifts"
        actionTo={ROUTES.products}
      />
    );
  }

  const pricing = getProductPricing(product, offers);
  const wishlisted = isWishlisted(product.id);
  // Fix (NEW-03 / TC-64): the catalogue, search and related products all
  // respected `available`, but this page did not — so a product the
  // admin had taken off sale still opened on its direct link with fully
  // working Add to Cart and Order Now buttons.
  const forSale = product.available !== false;

  function completeAddToCart(customization) {
    addItem(product, pricing, 1, customization);
  }

  function handleAddToCart() {
    if (product.customizable) {
      setPendingAction('cart');
      return;
    }
    completeAddToCart(null);
    setAddedMessage('Added to cart');
    setTimeout(() => setAddedMessage(''), 2000);
  }

  function handleOrderNow() {
    if (product.customizable) {
      setPendingAction('order');
      return;
    }
    completeAddToCart(null);
    navigate(ROUTES.cart);
  }

  function handleModalConfirm(customization) {
    completeAddToCart(customization);
    const action = pendingAction;
    setPendingAction(null);
    if (action === 'order') {
      navigate(ROUTES.cart);
    } else {
      setAddedMessage('Added to cart');
      setTimeout(() => setAddedMessage(''), 2000);
    }
  }

  return (
    <div className="section product-detail" key={product.id}>
      {/* Bug fix: keying this on product.id forces React to fully
          unmount and remount everything below whenever the product
          changes (rather than re-rendering the same instance in place,
          which is what React Router does by default for two URLs that
          match the same route). This resets ProductGallery's own image
          index, this component's addedMessage/pendingAction state, and
          any future per-product local state the same way — the general,
          durable fix, rather than patching each piece of state one by
          one. */}
      <div className="container product-detail__grid">
        <ProductGallery images={getProductImages(product)} name={product.name} size={product.size} />

        <div className="product-detail__info">
          <p className="product-detail__category">{product.category}</p>
          <h1>{product.name}</h1>
          {product.size && <p className="product-detail__size">Size: {product.size}</p>}

          <div className="product-detail__price-row">
            <span className="product-detail__price">{formatINR(pricing.finalPrice)}</span>
            {pricing.hasOffer && (
              <>
                <span className="product-detail__price-original">{formatINR(pricing.price)}</span>
                <span className="product-detail__offer-badge">
                  {pricing.discountPercent}% OFF · {pricing.offerName}
                </span>
              </>
            )}
          </div>

          <p className="product-detail__desc">{product.description}</p>

          {product.customizable && (
            <p className="product-detail__customizable-note">
              ✏️ Customizable — add a name or short description when ordering. Need a photo added (e.g. a photo
              frame)? You can send it directly in WhatsApp after placing your order.
            </p>
          )}

          {/* Security audit 2026-09-18 (SEC-04): admin-supplied href from
              Firestore, guarded to http(s) — React does not sanitize
              href, so a stored `javascript:` value would otherwise
              render as a working script link. */}
          {safeExternalUrl(product.instagramUrl) && (
            <a
              href={safeExternalUrl(product.instagramUrl)}
              target="_blank"
              rel="noreferrer"
              className="product-detail__instagram-link"
            >
              <InstagramIcon /> View on Instagram
            </a>
          )}

          {product.tags?.length > 0 && (
            <div className="product-detail__tags">
              {product.tags.slice(0, 6).map((tag) => (
                <span key={tag} className="product-detail__tag">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {forSale ? (
            <div className="product-detail__actions">
              <Button variant="primary" size="lg" onClick={handleAddToCart}>
                Add to Cart
              </Button>
              <Button variant="secondary" size="lg" onClick={handleOrderNow}>
                Order Now
              </Button>
            </div>
          ) : (
            <p className="product-detail__unavailable" role="status">
              This gift is currently unavailable. Message us on WhatsApp and we’ll let you know when it’s back,
              or browse the rest of the collection below.
            </p>
          )}

          <div className="product-detail__secondary-row">
            <button
              type="button"
              className={`product-detail__wishlist-btn ${wishlisted ? 'product-detail__wishlist-btn--active' : ''}`}
              onClick={() => toggleWishlist(product.id)}
              aria-pressed={wishlisted}
            >
              {wishlisted ? '♥ Wishlisted' : '♡ Add to Wishlist'}
            </button>

            {addedMessage && (
              <p className="product-detail__added-msg" role="status">
                {addedMessage} — <Link to={ROUTES.cart}>view cart</Link>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="container">
        <RelatedProducts products={related} />
      </div>

      {pendingAction && (
        <CustomizationModal productName={product.name} onClose={() => setPendingAction(null)} onConfirm={handleModalConfirm} />
      )}
    </div>
  );
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4.3" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" />
    </svg>
  );
}
