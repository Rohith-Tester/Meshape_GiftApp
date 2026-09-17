import { Link } from 'react-router-dom';
import QuantityStepper from './QuantityStepper';
import { formatINR } from '../../utils/currency';
import { getOptimizedImageUrl } from '../../utils/cloudinaryImage';
import { ROUTES } from '../../config/routes';
import './CartItemRow.css';

export default function CartItemRow({ line, onUpdateQuantity, onRemove }) {
  const lineTotal = line.finalPrice * line.quantity;

  return (
    <div className="cart-item">
      <Link to={ROUTES.productDetailPath(line.productId)} className="cart-item__media">
        <img src={getOptimizedImageUrl(line.image, { width: 200 })} alt={line.name} />
      </Link>

      <div className="cart-item__info">
        <Link to={ROUTES.productDetailPath(line.productId)} className="cart-item__name">
          {line.name}
        </Link>
        {line.size && <p className="cart-item__size">Size: {line.size}</p>}

        <div className="cart-item__price-row">
          <span className="cart-item__price">{formatINR(line.finalPrice)}</span>
          {line.discountPercent > 0 && (
            <>
              <span className="cart-item__price-original">{formatINR(line.price)}</span>
              <span className="cart-item__offer-tag">{line.discountPercent}% off</span>
            </>
          )}
        </div>

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
