import { Link } from 'react-router-dom';
import QuantityStepper from './QuantityStepper';
import { formatINR } from '../../utils/currency';
import { getOptimizedImageUrl } from '../../utils/cloudinaryImage';
import { ROUTES } from '../../config/routes';
import './CartItemRow.css';

export default function CartItemRow({ line, onUpdateQuantity, onRemove, onAcceptPrice }) {
  // `currentPrice` comes from useCartLines and reflects today's catalogue;
  // it falls back to the stored price on pages that don't reconcile.
  const effectivePrice = line.currentPrice ?? line.finalPrice;
  const lineTotal = effectivePrice * line.quantity;
  const repriced = line.status === 'repriced';
  const unsellable = line.status === 'removed' || line.status === 'unavailable';

  return (
    <div className={`cart-item ${unsellable ? 'cart-item--unsellable' : ''}`}>
      <Link to={ROUTES.productDetailPath(line.productId)} className="cart-item__media">
        <img src={getOptimizedImageUrl(line.image, { width: 200 })} alt={line.name} />
      </Link>

      <div className="cart-item__info">
        <Link to={ROUTES.productDetailPath(line.productId)} className="cart-item__name">
          {line.name}
        </Link>
        {line.size && <p className="cart-item__size">Size: {line.size}</p>}

        <div className="cart-item__price-row">
          <span className="cart-item__price">{formatINR(effectivePrice)}</span>
          {line.discountPercent > 0 && !repriced && (
            <>
              <span className="cart-item__price-original">{formatINR(line.price)}</span>
              <span className="cart-item__offer-tag">{line.discountPercent}% off</span>
            </>
          )}
        </div>

        {repriced && (
          <p className="cart-item__reprice" role="status">
            Price changed from {formatINR(line.finalPrice)} to {formatINR(effectivePrice)} since you added
            this.{' '}
            {onAcceptPrice && (
              <button type="button" className="cart-item__reprice-btn" onClick={onAcceptPrice}>
                Update price
              </button>
            )}
          </p>
        )}

        {unsellable && (
          <p className="cart-item__unsellable-note" role="status">
            {line.status === 'removed'
              ? 'This gift is no longer in our catalogue and cannot be ordered.'
              : 'This gift is currently unavailable and cannot be ordered.'}
          </p>
        )}

        {line.customization && (
          <div className="cart-item__customization">
            <p className="cart-item__customization-heading">Customization</p>
            {line.customization.name && (
              <p>
                <strong>Name:</strong> {line.customization.name}
              </p>
            )}
            {line.customization.message && (
              <p>
                <strong>Message:</strong> {line.customization.message}
              </p>
            )}
          </div>
        )}

        <div className="cart-item__row-bottom">
          <QuantityStepper quantity={line.quantity} onChange={(q) => onUpdateQuantity(line.lineId, q)} />
          <button type="button" className="cart-item__remove" onClick={() => onRemove(line.lineId)}>
            Remove
          </button>
        </div>
      </div>

      <div className="cart-item__total">{formatINR(lineTotal)}</div>
    </div>
  );
}
