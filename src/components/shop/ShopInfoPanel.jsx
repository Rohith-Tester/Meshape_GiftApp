import { business } from '../../config/business';
import './ShopInfoPanel.css';

export default function ShopInfoPanel() {
  return (
    <div className="shop-info-panel">
      <h2>Visit Us</h2>

      <dl className="shop-info-panel__list">
        <div>
          <dt>Address</dt>
          <dd>{business.address.full}</dd>
        </div>
        <div>
          <dt>Timing</dt>
          <dd>
            {business.hours.displayText}
            <br />
            {business.hours.weeklyHolidayText}
          </dd>
        </div>
        <div>
          <dt>Phone</dt>
          <dd>
            <a href={`tel:${business.contact.shopPhoneDigits}`}>{business.contact.shopPhone}</a>
          </dd>
        </div>
        <div>
          <dt>Instagram</dt>
          <dd>
            <a href={business.social.instagram} target="_blank" rel="noreferrer">
              @vandavasi_meshape_gift_shop
            </a>
          </dd>
        </div>
      </dl>

      <div className="shop-info-panel__actions">
        <a href={business.maps.googleMapsUrl} target="_blank" rel="noreferrer" className="shop-info-panel__maps-btn">
          View on Google Maps
        </a>
        <a href={business.maps.googleMapsUrl} target="_blank" rel="noreferrer" className="shop-info-panel__directions-btn">
          Get Directions
        </a>
      </div>
    </div>
  );
}
