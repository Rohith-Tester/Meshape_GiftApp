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
import { useCartLines, summarizeCartLines } from '../hooks/useCartLines';
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

  const { clearCart } = useCart();
  // Fix (BUG-04 / NEW-02 / NEW-03): the order is built from lines
  // reconciled against the live catalogue, never from the raw snapshot,
  // so a deleted, unavailable or repriced item can't reach the shop.
  const lines = useCartLines();
  const { orderable: items, subtotal, hasProblems } = summarizeCartLines(lines);
  const [fulfillment, setFulfillment] = useState(FULFILLMENT_METHODS.pickup);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [reviewed, setReviewed] = useState(false);
  // Generated once per checkout session — editing the form after review
  // keeps the same Order ID rather than minting a new one on every retry.
  const [order, setOrder] = useState(null); // { orderId, generatedAt }
  // Frozen copy of the message/link taken at the moment the order is
  // sent. Clearing the cart (BUG-02) empties `items`, which would
  // otherwise recompute the message down to "no items, Total ₹0" — so
  // "Reopen WhatsApp" would have sent a blank order.
  const [sentSnapshot, setSentSnapshot] = useState(null);
  const sent = sentSnapshot !== null;

  // The reconciled price is what the customer pays, so the message is
  // built from `currentPrice` rather than the stored snapshot.
  const messageItems = useMemo(
    () => items.map((line) => ({ ...line, finalPrice: line.currentPrice ?? line.finalPrice })),
    [items]
  );

  const liveMessage = useMemo(() => {
    if (!order) return '';
    return buildWhatsAppMessage({
      orderId: order.orderId,
      fulfillment,
      form,
      items: messageItems,
      subtotal,
      generatedAt: order.generatedAt,
    });
  }, [order, fulfillment, form, messageItems, subtotal]);

  // Once sent, always show and reuse exactly what was sent.
  const message = sentSnapshot ? sentSnapshot.message : liveMessage;
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

  // Something in the cart changed after the customer left it — send them
  // back to settle it rather than quietly ordering the rest.
  if (hasProblems && !order) {
    return (
      <div className="section">
        <div className="container">
          <EmptyState
            title="Some gifts in your cart have changed"
            description="One or more items were repriced or are no longer available. Review your cart and we'll pick this back up."
            actionLabel="Review My Cart"
            actionTo={ROUTES.cart}
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
    setSentSnapshot(null);
    setFulfillment(FULFILLMENT_METHODS.pickup);
  }

  /**
   * Fix (BUG-02): called when the customer opens WhatsApp, which is the
   * point the order actually leaves the site. The cart is emptied here
   * so a sent order can't be silently placed twice; the confirmation
   * (Order ID + message + a Reopen WhatsApp link) stays on screen,
   * because `order` is held in component state rather than derived from
   * the cart.
   */
  function handleSent() {
    // Freeze BEFORE clearing, so the snapshot still has the items.
    setSentSnapshot({ message: liveMessage });
    clearCart();
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
              onSent={handleSent}
              sent={sent}
            />
          )}
        </div>

        <aside id="order-review-panel">
          <OrderReviewSummary items={messageItems} subtotal={subtotal} fulfillment={fulfillment} form={form} />
        </aside>
      </div>
    </div>
  );
}
