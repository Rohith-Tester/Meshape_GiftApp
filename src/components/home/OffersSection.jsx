import SectionHeading from '../ui/SectionHeading';
import ProductGrid from '../product/ProductGrid';
import { getActiveOfferForProduct, getOfferStatus } from '../../utils/pricing';
import './OffersSection.css';

/**
 * Shows only offers that are currently active and only the products they
 * actually apply to — nothing here is hardcoded, it is recomputed from
 * src/data/offers.js against today's date every time this renders.
 */
export default function OffersSection({ products, offers }) {
  const now = new Date();
  // Fix (NEW-03): never surface a product that isn't for sale, even if
  // an offer technically still applies to it.
  const discountedProducts = products.filter((p) => p.available && getActiveOfferForProduct(p, offers, now));

  if (discountedProducts.length === 0) return null;

  // Fix (NEW-13): this used to re-implement the "is this offer live?"
  // date comparison inline, giving the project two copies of the same
  // rule that could drift apart. It now asks pricing.js, which is the
  // single definition used for prices, badges and the admin table.
  const activeOffers = offers.filter((offer) => getOfferStatus(offer, now) === 'active');

  return (
    <section className="section offers-section">
      <div className="container">
        <SectionHeading title="Live Offers" description="Limited-time savings across select gifts." />

        <div className="offers-section__ribbons">
          {activeOffers.map((offer) => (
            <div className="offer-ribbon" key={offer.id}>
              <span className="offer-ribbon__percent">{offer.discountPercent}% OFF</span>
              <span className="offer-ribbon__name">{offer.name}</span>
            </div>
          ))}
        </div>

        <ProductGrid products={discountedProducts} />
      </div>
    </section>
  );
}
