import { business, agency } from '../../config/business';
import './SettingsPanel.css';

export default function SettingsPanel() {
  return (
    <div className="settings-panel">
      <h2>Settings</h2>
      <p className="settings-panel__note">
        Business settings (address, hours, contact numbers) are intentionally kept in{' '}
        <code>src/config/business.js</code> rather than Firestore — unlike products/offers/gallery, this
        information changes rarely, and keeping it in code avoids an extra database round-trip on every page for
        data that isn't dynamic. To change it, edit that file and redeploy. See PROJECT_REQUIREMENTS.md for the
        full reasoning.
      </p>

      <dl className="settings-panel__list">
        <div>
          <dt>Business Name</dt>
          <dd>{business.name}</dd>
        </div>
        <div>
          <dt>Address</dt>
          <dd>{business.address.full}</dd>
        </div>
        <div>
          <dt>Hours</dt>
          <dd>
            {business.hours.displayText} · {business.hours.weeklyHolidayText}
          </dd>
        </div>
        <div>
          <dt>Order WhatsApp</dt>
          <dd>{business.contact.orderWhatsapp}</dd>
        </div>
        <div>
          <dt>Shop Phone</dt>
          <dd>{business.contact.shopPhone}</dd>
        </div>
        <div>
          <dt>Instagram</dt>
          <dd>{business.social.instagram}</dd>
        </div>
        <div>
          <dt>Google Maps</dt>
          <dd>{business.maps.googleMapsUrl}</dd>
        </div>
        <div>
          <dt>Developer Brand</dt>
          <dd>{agency.name} — {agency.tagline}</dd>
        </div>
      </dl>
    </div>
  );
}
