import { business } from '../../config/business';
import './OrderForms.css';

export default function PickupPanel({ form, errors, onChange }) {
  return (
    <div className="order-form">
      <div className="order-form__field">
        <label htmlFor="pickup-name">Your Name</label>
        {/* Security audit 2026-09-18 (SEC-08): bounded for the same
            reason as the delivery form -- both feed the wa.me link. */}
        <input
          id="pickup-name"
          type="text"
          maxLength={80}
          value={form.name}
          onChange={(e) => onChange('name', e.target.value)}
        />
        {errors.name && <span className="order-form__error">{errors.name}</span>}
      </div>

      <div className="order-form__field">
        <label htmlFor="pickup-mobile">Mobile Number</label>
        <input
          id="pickup-mobile"
          type="tel"
          maxLength={20}
          value={form.mobile}
          onChange={(e) => onChange('mobile', e.target.value)}
          placeholder="10-digit mobile number"
        />
        {errors.mobile && <span className="order-form__error">{errors.mobile}</span>}
      </div>

      <div className="order-form__pickup-info">
        <p className="order-form__pickup-info-title">{business.name}</p>
        <p>{business.address.full}</p>
        <p>
          {business.hours.displayText} · {business.hours.weeklyHolidayText}
        </p>
      </div>
    </div>
  );
}
