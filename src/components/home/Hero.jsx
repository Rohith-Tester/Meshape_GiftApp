import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import SearchBar from '../search/SearchBar';
import { ROUTES } from '../../config/routes';
import './Hero.css';

/**
 * The one deliberate "big moment" for this page: headline, subtext, and
 * actions reveal in a single staggered sequence on load. Floating
 * gift/heart/ribbon accents drift continuously in the background — an
 * ambient, ornamental layer explicitly called for in the brief, kept
 * subtle and GPU-cheap (transform-only animation).
 */
export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__glow" aria-hidden="true" />
      <FloatingAccents />
      <TeddyIllustration />

      <div className="container hero__content">
        <p className="hero__kicker">
          <img
            className="hero__kicker-logo"
            src="/meshape-logo.png"
            alt="Meshape"
            width="127"
            height="36"
          />
          <span className="hero__kicker-text">Gift Shop</span>
        </p>
        <h1 className="hero__headline">
          <span className="hero__line">Make Every Moment</span>
          <span className="hero__line hero__line--accent">Extra Special</span>
        </h1>
        <p className="hero__subtext">
          Personalized mugs, lamps, keychains and gift hampers — thoughtfully made and ready for pickup
          or delivery, anywhere in India.
        </p>

        <div className="hero__search">
          <SearchBar variant="hero" />
        </div>

        <div className="hero__actions">
          <Button as={Link} to={ROUTES.products} variant="primary" size="lg">
            Shop Now
          </Button>
          <Button as={Link} to={ROUTES.products} variant="secondary" size="lg">
            Explore Gifts
          </Button>
        </div>
      </div>
    </section>
  );
}

/**
 * Fills the empty right-hand space in the hero on wide screens — a
 * white teddy bear with a couple of gift boxes, gently bobbing.
 * Hidden below the breakpoint in Hero.css where that space is needed
 * for the text/search content instead.
 */
function TeddyIllustration() {
  return (
    <div className="hero__teddy" aria-hidden="true">
      <svg viewBox="0 0 420 440" xmlns="http://www.w3.org/2000/svg">
        {/* soft ground shadow */}
        <ellipse cx="210" cy="410" rx="120" ry="16" fill="rgba(0,0,0,0.18)" />

        {/* gift box — back, larger */}
        <g transform="translate(255,255)">
          <rect x="-3" y="-3" width="106" height="96" rx="6" fill="var(--color-gold-600)" />
          <rect x="0" y="0" width="100" height="90" rx="4" fill="var(--color-gold-500)" />
          <rect x="42" y="0" width="16" height="90" fill="var(--color-ivory-50)" opacity="0.85" />
          <rect x="0" y="36" width="100" height="16" fill="var(--color-ivory-50)" opacity="0.85" />
          <path d="M42 0c0-16 -14-26-22-14 8 4 16 8 22 14zM58 0c0-16 14-26 22-14 -8 4-16 8-22 14z" fill="var(--color-ivory-50)" opacity="0.85" />
        </g>

        {/* gift box — front, smaller */}
        <g transform="translate(70,290)">
          <rect x="-3" y="-3" width="76" height="66" rx="6" fill="var(--color-raspberry-700)" />
          <rect x="0" y="0" width="70" height="60" rx="4" fill="var(--color-raspberry-500)" />
          <rect x="28" y="0" width="14" height="60" fill="var(--color-gold-200)" />
          <rect x="0" y="24" width="70" height="14" fill="var(--color-gold-200)" />
          <path d="M28 0c0-13 -11-21-18-11 6 3 13 6 18 11zM42 0c0-13 11-21 18-11 -6 3-13 6-18 11z" fill="var(--color-gold-200)" />
        </g>

        {/* teddy bear */}
        <g transform="translate(115,60)">
          {/* ears */}
          <circle cx="18" cy="26" r="26" fill="var(--color-ivory-0)" />
          <circle cx="150" cy="26" r="26" fill="var(--color-ivory-0)" />
          <circle cx="18" cy="26" r="12" fill="var(--color-blush-50)" />
          <circle cx="150" cy="26" r="12" fill="var(--color-blush-50)" />

          {/* head */}
          <circle cx="84" cy="70" r="66" fill="var(--color-ivory-0)" />

          {/* muzzle */}
          <ellipse cx="84" cy="90" rx="34" ry="26" fill="var(--color-blush-50)" />

          {/* face */}
          <circle cx="60" cy="60" r="6" fill="var(--color-plum-950)" />
          <circle cx="108" cy="60" r="6" fill="var(--color-plum-950)" />
          <ellipse cx="84" cy="82" rx="8" ry="6" fill="var(--color-plum-950)" />
          <path
            d="M84 88c0 10 -14 16 -22 8M84 88c0 10 14 16 22 8"
            stroke="var(--color-plum-950)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />

          {/* body */}
          <ellipse cx="84" cy="222" rx="80" ry="86" fill="var(--color-ivory-0)" />
          <ellipse cx="84" cy="232" rx="42" ry="48" fill="var(--color-blush-50)" />

          {/* arms hugging the front gift box */}
          <ellipse cx="-8" cy="220" rx="26" ry="46" fill="var(--color-ivory-0)" transform="rotate(-18 -8 220)" />
          <ellipse cx="176" cy="210" rx="26" ry="46" fill="var(--color-ivory-0)" transform="rotate(20 176 210)" />

          {/* feet */}
          <ellipse cx="38" cy="300" rx="26" ry="20" fill="var(--color-ivory-0)" />
          <ellipse cx="130" cy="300" rx="26" ry="20" fill="var(--color-ivory-0)" />
          <ellipse cx="38" cy="304" rx="14" ry="10" fill="var(--color-blush-50)" />
          <ellipse cx="130" cy="304" rx="14" ry="10" fill="var(--color-blush-50)" />

          {/* neck ribbon */}
          <path d="M50 150c14 12 20 12 34 12s20 0 34-12" stroke="var(--color-raspberry-500)" strokeWidth="10" fill="none" strokeLinecap="round" />
          <circle cx="84" cy="160" r="10" fill="var(--color-raspberry-500)" />
        </g>

        {/* sparkle accents to match the rest of the hero's ornamental motif */}
        <circle className="hero__teddy-sparkle" cx="60" cy="40" r="4" fill="var(--color-gold-200)" />
        <circle className="hero__teddy-sparkle" cx="360" cy="90" r="5" fill="var(--color-gold-200)" style={{ animationDelay: '0.8s' }} />
        <circle className="hero__teddy-sparkle" cx="340" cy="220" r="3.5" fill="var(--color-gold-200)" style={{ animationDelay: '1.4s' }} />
      </svg>
    </div>
  );
}

function FloatingAccents() {
  const accents = [
    { style: { top: '14%', left: '8%', animationDelay: '0s' }, icon: <GiftIcon /> },
    { style: { top: '22%', right: '10%', animationDelay: '0.6s' }, icon: <HeartIcon /> },
    { style: { bottom: '18%', left: '14%', animationDelay: '1.1s' }, icon: <RibbonIcon /> },
    { style: { bottom: '26%', right: '16%', animationDelay: '1.6s' }, icon: <HeartIcon small /> },
    { style: { top: '48%', left: '3%', animationDelay: '0.3s' }, icon: <SparkleDot /> },
    { style: { top: '58%', right: '4%', animationDelay: '0.9s' }, icon: <SparkleDot /> },
  ];

  return (
    <div className="hero__accents" aria-hidden="true">
      {accents.map((a, i) => (
        <span className="hero__accent" style={a.style} key={i}>
          {a.icon}
        </span>
      ))}
    </div>
  );
}

function GiftIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="9" width="18" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3 9h18M12 9v11" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M12 9c-2-3.5-7-3.5-7-.5 0 1.6 3 .5 7 .5zM12 9c2-3.5 7-3.5 7-.5 0 1.6-3 .5-7 .5z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HeartIcon({ small }) {
  const size = small ? 22 : 30;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 20s-7.2-4.35-9.6-9.06C.86 7.86 2.4 4.5 5.7 4.02c2-.3 3.86.63 4.8 2.34a4.66 4.66 0 0 1 1.5-1.8c1.6-1.2 3.9-1.02 5.4.6 1.9 2.04 1.66 5.1-.3 7.8C15.3 15.7 12 20 12 20z" />
    </svg>
  );
}

function RibbonIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.4" />
      <path d="M9 10l-3 10 6-3 6 3-3-10" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function SparkleDot() {
  return <span className="hero__sparkle" />;
}
