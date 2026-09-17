import { Link } from 'react-router-dom';
import { business, agency } from '../../config/business';
import { PRIMARY_NAV_LINKS } from '../../config/routes';
import './Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__col footer__col--brand">
          <img src="/meshape-logo.png" alt="MeShape Gift Shop" className="footer__brand-logo" />
          <p className="footer__text">{business.address.full}</p>
          <p className="footer__text">
            {business.hours.displayText} · {business.hours.weeklyHolidayText}
          </p>
        </div>

        <nav className="footer__col" aria-label="Footer">
          <p className="footer__heading">Explore</p>
          {PRIMARY_NAV_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="footer__link">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="footer__col">
          <p className="footer__heading">Reach Us</p>
          <a className="footer__link" href={business.social.instagram} target="_blank" rel="noreferrer">
            Instagram
          </a>
          <a className="footer__link" href={business.maps.googleMapsUrl} target="_blank" rel="noreferrer">
            Get Directions
          </a>
        </div>
      </div>

      <div className="container footer__bottom">
        <p className="footer__copyright">
          © {year} {business.name}. All rights reserved.
        </p>

        <a
          className="footer__credit"
          href="#"
          onClick={(e) => e.preventDefault()}
          aria-label={agency.tagline}
          title={agency.tagline}
        >
          <span className="footer__credit-text">Designed &amp; Developed by</span>
          <CraftTechMark />
        </a>
      </div>
    </footer>
  );
}

/**
 * Renders the real Craft Tech logo once it is placed at the path defined
 * in src/config/business.js. Falls back to a plain text wordmark so the
 * footer never shows a broken image before the client's asset is added.
 */
function CraftTechMark() {
  return (
    <span className="footer__credit-mark">
      <img
        src={agency.logoPath}
        alt={agency.name}
        className="footer__credit-logo"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          e.currentTarget.nextSibling.style.display = 'inline';
        }}
      />
      <span className="footer__credit-fallback">{agency.name}</span>
    </span>
  );
}
