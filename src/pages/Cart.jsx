import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CartItemRow from '../components/cart/CartItemRow';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import { useCart } from '../context/CartContext';
import { formatINR } from '../utils/currency';
import { ROUTES } from '../config/routes';
import { useDocumentHead } from '../hooks/useDocumentHead';
import './Cart.css';

export default function Cart() {
  useDocumentHead({ title: 'Your Cart', description: 'Review the gifts in your cart.', noindex: true });

  const { items, updateQuantity, removeItem, subtotal, totalItems } = useCart();
  const navigate = useNavigate();

  // Same technique as ProductDetail/Order: adds a class only while this
  // page is open, so the fixed Proceed to Order button (see Cart.css)
  // can push the floating WhatsApp bubble up out of its way on mobile.
  useEffect(() => {
    document.body.classList.add('has-sticky-product-actions');
    return () => document.body.classList.remove('has-sticky-product-actions');
  }, []);

  if (items.length === 0) {
    return (
      <div className="section">
        <div className="container">
          <EmptyState
            icon={<BagOutlineIcon />}
            title="Your cart is empty"
            description="Add a few gifts you love and they'll show up here, ready for checkout."
            actionLabel="Browse All Gifts"
            actionTo={ROUTES.products}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container cart-page__grid">
        <div className="cart-page__items">
          <h1>Your Cart</h1>
          {items.map((line) => (
            <CartItemRow key={line.lineId} line={line} onUpdateQuantity={updateQuantity} onRemove={removeItem} />
          ))}
          <Link to={ROUTES.products} className="cart-page__continue">
            ← Continue Shopping
          </Link>
        </div>

        <aside className="cart-summary">
          <h2>Order Summary</h2>
          <div className="cart-summary__row">
            <span>Items ({totalItems})</span>
            <span>{formatINR(subtotal)}</span>
          </div>
          <p className="cart-summary__note">Delivery charge, if applicable, will be confirmed by the shop.</p>
          <div className="cart-summary__row cart-summary__row--total">
            <span>Total</span>
            <span>{formatINR(subtotal)}</span>
          </div>
          <Button variant="primary" size="lg" className="cart-summary__checkout" onClick={() => navigate(ROUTES.order)}>
            Proceed to Order
          </Button>
        </aside>
      </div>
    </div>
  );
}

function BagOutlineIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 9V7a6 6 0 0 1 12 0v2M4.5 9h15l-1 11.5a1.5 1.5 0 0 1-1.5 1.4H7a1.5 1.5 0 0 1-1.5-1.4L4.5 9z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
