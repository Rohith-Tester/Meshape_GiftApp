import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import { business } from '../../config/business';
import { ROUTES } from '../../config/routes';
import './ShopPreview.css';

export default function ShopPreview() {
  return (
    <section className="section shop-preview">
      <div className="container shop-preview__grid">
        <div className="shop-preview__media">
          <img src="/meshape-logo.png" alt="MeShape Gift Shop" loading="lazy" />
        </div>
        <div className="shop-preview__content">
          <h2>Visit Our Shop</h2>
          <p>{business.address.full}</p>
          <p className="shop-preview__hours">
            {business.hours.displayText} · {business.hours.weeklyHolidayText}
          </p>
          <div className="shop-preview__actions">
            <Button as={Link} to={ROUTES.shop} variant="primary">
              See Shop Gallery
            </Button>
            <a href={business.maps.googleMapsUrl} target="_blank" rel="noreferrer" className="shop-preview__maps-link">
              Get Directions →
            </a>
          </div>
          <a href={business.social.instagram} target="_blank" rel="noreferrer" className="shop-preview__instagram-link">
            Follow us on Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
