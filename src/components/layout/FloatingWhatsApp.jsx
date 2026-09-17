import { business } from '../../config/business';
import './FloatingWhatsApp.css';

export default function FloatingWhatsApp() {
  return (
    <a
      href={`https://wa.me/${business.contact.orderWhatsappDigits}`}
      target="_blank"
      rel="noreferrer"
      className="floating-whatsapp"
      aria-label={`Chat on WhatsApp: ${business.contact.orderWhatsapp}`}
    >
      <span className="floating-whatsapp__ring" aria-hidden="true" />
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M17.5 14.4c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.9-.8-1.5-1.78-1.68-2.08-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.87 1.21 3.07c.15.2 2.09 3.2 5.06 4.48.7.3 1.25.48 1.68.62.7.22 1.34.19 1.84.12.56-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z"
          fill="currentColor"
        />
        <path
          d="M12.03 2.5c-5.25 0-9.5 4.25-9.5 9.5 0 1.68.44 3.25 1.2 4.62L2.5 21.5l4.98-1.3a9.46 9.46 0 0 0 4.55 1.16c5.25 0 9.5-4.25 9.5-9.5s-4.25-9.36-9.5-9.36z"
          stroke="currentColor"
          strokeWidth="1.3"
        />
      </svg>
    </a>
  );
}
