import { business } from '../config/business';
import { useDocumentHead } from '../hooks/useDocumentHead';
import './Contact.css';

/**
 * A full contact form is not part of the Master Specification's phase
 * plan — WhatsApp (Phase 4) is the primary order/contact channel. This
 * page focuses on what section 25 explicitly requires: real contact
 * details and a clickable Instagram link, alongside Maps.
 */
export default function Contact() {
  useDocumentHead({
    title: 'Contact Us',
    description: 'Reach MeShape Gift Shop on WhatsApp, phone, Instagram, or get directions to the shop.',
  });

  return (
    <div className="section contact-page">
      <div className="container contact-page__inner">
        <h1>Contact Us</h1>
        <p className="contact-page__intro">
          Have a question about an order, a custom gift, or just want to say hello? Reach us any of these ways.
        </p>

        <div className="contact-page__grid">
          <a className="contact-card" href={`https://wa.me/${business.contact.orderWhatsappDigits}`} target="_blank" rel="noreferrer">
            <span className="contact-card__label">WhatsApp</span>
            <span className="contact-card__value">{business.contact.orderWhatsapp}</span>
          </a>

          <a className="contact-card" href={`tel:${business.contact.shopPhoneDigits}`}>
            <span className="contact-card__label">Call the Shop</span>
            <span className="contact-card__value">{business.contact.shopPhone}</span>
          </a>

          <a className="contact-card" href={business.social.instagram} target="_blank" rel="noreferrer">
            <span className="contact-card__label">Instagram</span>
            <span className="contact-card__value">@vandavasi_meshape_gift_shop</span>
          </a>

          <a className="contact-card" href={business.maps.googleMapsUrl} target="_blank" rel="noreferrer">
            <span className="contact-card__label">Get Directions</span>
            <span className="contact-card__value">{business.address.full}</span>
          </a>
        </div>

        <p className="contact-page__hours">
          {business.hours.displayText} · {business.hours.weeklyHolidayText}
        </p>
      </div>
    </div>
  );
}
