import { INDIAN_STATES, DELIVERY_CHARGE_TEXT } from '../../config/delivery';
import './OrderForms.css';

/**
 * Security audit 2026-09-18 (SEC-08): every value typed here is
 * URL-encoded into the wa.me link built by
 * src/utils/whatsappMessage.js. Nothing bounded these fields, so a
 * paste of a few hundred kB produced a link long enough that WhatsApp
 * (and some browsers) silently truncate or refuse it — the customer
 * presses "Send Order" and nothing usable reaches the shop, with no
 * error shown. The pincode field already had a maxLength; these now
 * match it. The limits are generous for real Indian addresses.
 *
 * validateDeliveryForm still does the real checking; this only stops a
 * value from growing without bound before it gets there.
 */
const FIELDS = [
  { key: 'name', label: 'Your Name', type: 'text', maxLength: 80 },
  { key: 'mobile', label: 'Mobile Number', type: 'tel', placeholder: '10-digit mobile number', maxLength: 20 },
  { key: 'houseNumber', label: 'House / Door Number', type: 'text', maxLength: 60 },
  { key: 'street', label: 'Street', type: 'text', maxLength: 120 },
  { key: 'area', label: 'Area', type: 'text', maxLength: 120 },
  { key: 'city', label: 'City', type: 'text', maxLength: 80 },
  { key: 'district', label: 'District', type: 'text', maxLength: 80 },
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
            maxLength={field.maxLength}
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
          maxLength={500}
          value={form.instructions}
          onChange={(e) => onChange('instructions', e.target.value)}
        />
      </div>

      <p className="order-form__delivery-charge-note">Delivery Charge: {DELIVERY_CHARGE_TEXT}</p>
    </div>
  );
}
