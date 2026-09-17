import { FULFILLMENT_METHODS } from '../../config/delivery';
import './FulfillmentToggle.css';

const OPTIONS = [
  { value: FULFILLMENT_METHODS.pickup, label: 'Pickup', desc: 'Collect from the shop' },
  { value: FULFILLMENT_METHODS.delivery, label: 'Home Delivery', desc: 'Delivered to your address' },
];

export default function FulfillmentToggle({ value, onChange }) {
  return (
    <div className="fulfillment-toggle" role="radiogroup" aria-label="Choose fulfillment method">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={value === opt.value}
          className={`fulfillment-toggle__option ${value === opt.value ? 'fulfillment-toggle__option--active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          <span className="fulfillment-toggle__label">{opt.label}</span>
          <span className="fulfillment-toggle__desc">{opt.desc}</span>
        </button>
      ))}
    </div>
  );
}
