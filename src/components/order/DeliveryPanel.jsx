import { INDIAN_STATES, DELIVERY_CHARGE_TEXT } from '../../config/delivery';
import './OrderForms.css';

const FIELDS = [
  { key: 'name', label: 'Your Name', type: 'text' },
  { key: 'mobile', label: 'Mobile Number', type: 'tel', placeholder: '10-digit mobile number' },
  { key: 'houseNumber', label: 'House / Door Number', type: 'text' },
  { key: 'street', label: 'Street', type: 'text' },
  { key: 'area', label: 'Area', type: 'text' },
  { key: 'city', label: 'City', type: 'text' },
  { key: 'district', label: 'District', type: 'text' },
];

export default function DeliveryPanel({ form, errors, onChange }) {
  return (
    <div className="order-form">
      {FIELDS.map((field) => (
        <div className="order-form__field" key={field.key}>
          <label htmlFor={`delivery-${field.key}`}>{field.label}</label>
          <input
            id={`delivery-${field.key}`}
            type={field.type}
            value={form[field.key]}
            placeholder={field.placeholder}
            onChange={(e) => onChange(field.key, e.target.value)}
          />
          {errors[field.key] && <span className="order-form__error">{errors[field.key]}</span>}
        </div>
      ))}

      <div className="order-form__field">
        <label htmlFor="delivery-state">State</label>
        <select id="delivery-state" value={form.state} onChange={(e) => onChange('state', e.target.value)}>
          <option value="">Select state</option>
          {INDIAN_STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {errors.state && <span className="order-form__error">{errors.state}</span>}
      </div>

      <div className="order-form__field">
        <label htmlFor="delivery-pincode">Pincode</label>
        <input
          id="delivery-pincode"
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={form.pincode}
          onChange={(e) => onChange('pincode', e.target.value)}
        />
        {errors.pincode && <span className="order-form__error">{errors.pincode}</span>}
      </div>

      <div className="order-form__field">
        <label htmlFor="delivery-instructions">Additional Instructions (optional)</label>
        <textarea
          id="delivery-instructions"
          rows={2}
          value={form.instructions}
          onChange={(e) => onChange('instructions', e.target.value)}
        />
      </div>

      <p className="order-form__delivery-charge-note">Delivery Charge: {DELIVERY_CHARGE_TEXT}</p>
    </div>
  );
}
