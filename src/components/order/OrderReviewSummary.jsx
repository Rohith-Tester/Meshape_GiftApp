import { formatINR } from '../../utils/currency';
import { getOptimizedImageUrl } from '../../utils/cloudinaryImage';
import { DELIVERY_CHARGE_TEXT, FULFILLMENT_METHODS } from '../../config/delivery';
import './OrderReviewSummary.css';

export default function OrderReviewSummary({ items, subtotal, fulfillment, form }) {
  return (
    <div className="order-review">
      <h2>Order Summary</h2>

      <ul className="order-review__items">
        {items.map((line) => (
          <li key={line.lineId} className="order-review__item">
            <img src={getOptimizedImageUrl(line.image, { width: 100 })} alt={line.name} />
            <div className="order-review__item-info">
              <p className="order-review__item-name">
                {line.name} × {line.quantity}
              </p>
              {line.size && <p className="order-review__item-size">Size: {line.size}</p>}
              {line.customization && (
                <p className="order-review__item-custom">
                  {[line.customization.name, line.customization.message].filter(Boolean).join(' · ') || 'Customized'}
                </p>
              )}
            </div>
            <span className="order-review__item-price">{formatINR(line.finalPrice * line.quantity)}</span>
          </li>
        ))}
      </ul>

      <div className="order-review__row">
        <span>Subtotal</span>
        <span>{formatINR(subtotal)}</span>
      </div>
      <div className="order-review__row">
        <span>Delivery Charge</span>
        <span>{fulfillment === FULFILLMENT_METHODS.delivery ? DELIVERY_CHARGE_TEXT : 'Not applicable (pickup)'}</span>
      </div>
      <div className="order-review__row order-review__row--total">
        <span>Total (excl. delivery)</span>
        <span>{formatINR(subtotal)}</span>
      </div>

      <div className="order-review__fulfillment">
        <p className="order-review__fulfillment-title">
          {fulfillment === FULFILLMENT_METHODS.pickup ? 'Pickup Details' : 'Delivery Address'}
        </p>
        <p>{form.name || '—'}</p>
        <p>{form.mobile || '—'}</p>
        {fulfillment === FULFILLMENT_METHODS.delivery && (
          <p>
            {[form.houseNumber, form.street, form.area, form.city, form.district, form.state, form.pincode]
              .filter(Boolean)
              .join(', ') || '—'}
          </p>
        )}
        {/* Fix (BUG-03): show the instructions back to the customer, so
            it is visible that they will be sent rather than dropped. */}
        {fulfillment === FULFILLMENT_METHODS.delivery && form.instructions?.trim() && (
          <p className="order-review__instructions">
            <strong>Instructions:</strong> {form.instructions.trim()}
          </p>
        )}
      </div>
    </div>
  );
}
