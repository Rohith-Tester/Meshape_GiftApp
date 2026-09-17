import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import { business } from '../../config/business';
import { ROUTES } from '../../config/routes';
import './CTASection.css';

export default function CTASection() {
  return (
    <section className="cta-section">
      <div className="container cta-section__inner">
        <h2>Ready to send something special?</h2>
        <p>Browse the full collection or message us directly — we reply fast on WhatsApp.</p>
        <div className="cta-section__actions">
          <Button as={Link} to={ROUTES.products} variant="primary" size="lg">
            Browse All Gifts
          </Button>
          <a
            href={`https://wa.me/${business.contact.orderWhatsappDigits}`}
            target="_blank"
            rel="noreferrer"
            className="cta-section__whatsapp"
          >
            Message us on WhatsApp →
          </a>
        </div>
      </div>
    </section>
  );
}
