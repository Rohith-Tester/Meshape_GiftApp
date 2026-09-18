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

        {/* Fix (BUG-14): this was an <a href="#"> with preventDefault —
            it looked and behaved like a link (pointer cursor, focusable,
            announced as a link) but went nowhere. There is no agency URL
            to point at, so it is simply a credit line now. Give
            `agency.url` a value and it becomes a real link again. */}
        {agency.url ? (
          <a
            className="footer__credit"
            href={agency.url}
            target="_blank"
            rel="noreferrer"
            title={agency.tagline}
          >
            <span className="footer__credit-text">Designed &amp; Developed by</span>
            <CraftTechMark />
          </a>
        ) : (
          <p className="footer__credit" title={agency.tagline}>
            <span className="footer__credit-text">Designed &amp; Developed by</span>
            <CraftTechMark />
          </p>
        )}
      </div>
    </footer>
  );
}

/**
 * Renders the real Craft Tech logo once it is placed in public/ and
 * `agency.logoPath` points at it. Until then this is a plain text
 * wordmark.
 *
 * Fix (BUG-15): logoPath used to point unconditionally at
 * /craft-tech-logo.svg, a file that does not exist in public/. Every
 * single page load therefore fired a request that 404'd, and the
 * onError handler hid the broken image so convincingly that the missing
 * asset was invisible in review — the client's real logo would never
 * have shown in production either. We only render an <img> when there
 * is actually a path configured.
 */
function CraftTechMark() {
  if (!agency.logoPath) {
    return <span className="footer__credit-mark">{agency.name}</span>;
  }

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
