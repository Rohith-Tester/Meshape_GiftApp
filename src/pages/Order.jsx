import { useEffect, useMemo, useState } from 'react';
import FulfillmentToggle from '../components/order/FulfillmentToggle';
import PickupPanel from '../components/order/PickupPanel';
import DeliveryPanel from '../components/order/DeliveryPanel';
import OrderReviewSummary from '../components/order/OrderReviewSummary';
import OrderConfirmation from '../components/order/OrderConfirmation';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import { useCart } from '../context/CartContext';
import { FULFILLMENT_METHODS } from '../config/delivery';
import { validatePickupForm, validateDeliveryForm } from '../utils/validation';
import { generateOrderId } from '../utils/orderId';
import { buildWhatsAppMessage, buildWhatsAppLink } from '../utils/whatsappMessage';
import { ROUTES } from '../config/routes';
import { useDocumentHead } from '../hooks/useDocumentHead';
import './Order.css';

const EMPTY_FORM = {
  name: '',
  mobile: '',
  houseNumber: '',
  street: '',
  area: '',
  city: '',
  district: '',
  state: '',
  pincode: '',
  instructions: '',
};

export default function Order() {
  useDocumentHead({ title: 'Complete Your Order', description: 'Choose pickup or delivery and review your order.', noindex: true });

  const { items, subtotal, clearCart } = useCart();
  const [fulfillment, setFulfillment] = useState(FULFILLMENT_METHODS.pickup);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [reviewed, setReviewed] = useState(false);
  // Generated once per checkout session — editing the form after review
  // keeps the same Order ID rather than minting a new one on every retry.
  const [order, setOrder] = useState(null); // { orderId, generatedAt }

  const message = useMemo(() => {
    if (!order) return '';
    return buildWhatsAppMessage({ orderId: order.orderId, fulfillment, form, items, subtotal, generatedAt: order.generatedAt });
  }, [order, fulfillment, form, items, subtotal]);

  const whatsappLink = useMemo(() => (message ? buildWhatsAppLink(message) : ''), [message]);

  // Same technique as ProductDetail: adds a class only while this page
  // is open, so the fixed Review Order button (see Order.css) can push
  // the floating WhatsApp bubble up out of its way on mobile.
  useEffect(() => {
    document.body.classList.add('has-sticky-product-actions');
    return () => document.body.classList.remove('has-sticky-product-actions');
  }, []);

  if (items.length === 0 && !order) {
    return (
      <div className="section">
        <div className="container">
          <EmptyState
            title="Your cart is empty"
            description="Add a few gifts before placing an order."
            actionLabel="Browse All Gifts"
            actionTo={ROUTES.products}
          />
        </div>
      </div>
    );
  }

  function handleFieldChange(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    setReviewed(false);
  }

  function handleFulfillmentChange(value) {
    setFulfillment(value);
    setReviewed(false);
    setErrors({});
  }

  function handleReview(e) {
    e.preventDefault();
    const validationErrors =
      fulfillment === FULFILLMENT_METHODS.pickup ? validatePickupForm(form) : validateDeliveryForm(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setReviewed(false);
      return;
    }

    setReviewed(true);
    if (!order) {
      setOrder({ orderId: generateOrderId(), generatedAt: new Date() });
    }
    document.getElementById('order-review-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleStartNewOrder() {
    clearCart();
    setOrder(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setReviewed(false);
    setFulfillment(FULFILLMENT_METHODS.pickup);
  }

  return (
    <div className="section">
      <div className="container order-page__grid">
        <div className="order-page__form">
          <h1>Complete Your Order</h1>

          <FulfillmentToggle value={fulfillment} onChange={handleFulfillmentChange} />

          <form onSubmit={handleReview}>
            {fulfillment === FULFILLMENT_METHODS.pickup ? (
              <PickupPanel form={form} errors={errors} onChange={handleFieldChange} />
            ) : (
              <DeliveryPanel form={form} errors={errors} onChange={handleFieldChange} />
            )}

            <Button type="submit" variant="primary" size="lg" className="order-page__review-btn">
              {order ? 'Update Review' : 'Review Order'}
            </Button>
          </form>

          {reviewed && order && (
            <OrderConfirmation
              orderId={order.orderId}
              message={message}
              whatsappLink={whatsappLink}
              onStartNewOrder={handleStartNewOrder}
            />
          )}
        </div>

        <aside id="order-review-panel">
          <OrderReviewSummary items={items} subtotal={subtotal} fulfillment={fulfillment} form={form} />
        </aside>
      </div>
    </div>
  );
}
