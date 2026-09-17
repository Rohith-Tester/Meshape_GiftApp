import SectionHeading from '../ui/SectionHeading';
import ProductGrid from '../product/ProductGrid';
import { getActiveOfferForProduct } from '../../utils/pricing';
import './OffersSection.css';

/**
 * Shows only offers that are currently active and only the products they
 * actually apply to — nothing here is hardcoded, it is recomputed from
 * src/data/offers.js against today's date every time this renders.
 */
export default function OffersSection({ products, offers }) {
  const now = new Date();
  const discountedProducts = products.filter((p) => getActiveOfferForProduct(p, offers, now));

  if (discountedProducts.length === 0) return null;

  const activeOffers = offers.filter((offer) => {
    const start = offer.startDate ? new Date(`${offer.startDate}T00:00:00`) : null;
    const end = offer.endDate ? new Date(`${offer.endDate}T23:59:59`) : null;
    return offer.active && (!start || now >= start) && (!end || now <= end);
  });

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
