import './WhyChooseUs.css';

const REASONS = [
  {
    title: 'Genuinely Personalized',
    desc: 'Photos, names and messages added by hand — not a generic print run.',
    icon: <SparkIcon />,
  },
  {
    title: 'Pickup or Delivery',
    desc: 'Collect from our shop the same day, or have it delivered anywhere in India.',
    icon: <TruckIcon />,
  },
  {
    title: 'Order on WhatsApp',
    desc: 'No account needed — review your order and send it straight to us on WhatsApp.',
    icon: <ChatIcon />,
  },
  {
    title: 'Made for Every Occasion',
    desc: 'Birthdays, anniversaries, festivals or "just because" — there is a gift here for it.',
    icon: <GiftTagIcon />,
  },
];

export default function WhyChooseUs() {
  return (
    <section className="section why-choose-us">
      <div className="container">
        <h2>Why Choose MeShape</h2>
        <div className="why-choose-us__grid">
          {REASONS.map((reason) => (
            <div className="why-choose-us__item" key={reason.title}>
              <div className="why-choose-us__icon">{reason.icon}</div>
              <h3>{reason.title}</h3>
              <p>{reason.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SparkIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 7h11v10H3zM14 11h4l3 3v3h-7zM6.5 20a1.8 1.8 0 100-3.6 1.8 1.8 0 000 3.6zM17.5 20a1.8 1.8 0 100-3.6 1.8 1.8 0 000 3.6z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path
        d="M21 11.5a8.5 8.5 0 01-12.4 7.55L3 20l1.1-5.3A8.5 8.5 0 1121 11.5z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GiftTagIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="9" width="18" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3 9h18M12 9v11" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
