import Hero from '../components/home/Hero';
import ProductShowcase from '../components/home/ProductShowcase';
import OffersSection from '../components/home/OffersSection';
import WhyChooseUs from '../components/home/WhyChooseUs';
import ShopPreview from '../components/home/ShopPreview';
import CTASection from '../components/home/CTASection';
import DataLoadError from '../components/ui/DataLoadError';
import { useProducts } from '../context/ProductsContext';
import { useOffers } from '../context/OffersContext';
import { useDocumentHead } from '../hooks/useDocumentHead';
import { useDeferredRender } from '../hooks/useDeferredRender';

export default function Home() {
  useDocumentHead({
    title: 'Personalized & Premium Gifts',
    description:
      'MeShape Gift Shop — personalized mugs, lamps, keychains, cushions and gift hampers. Order online for pickup or delivery across India.',
  });

  const { products, error: productsError, loading: productsLoading, retry: retryProducts } = useProducts();
  const { offers } = useOffers();

  // Only the hero is above the fold on a phone. Everything below it is
  // kept out of React's first render so the browser can paint the hero
  // (already present in index.html's static shell) instead of waiting
  // for six more sections to be built first — see useDeferredRender.
  const showBelowTheFold = useDeferredRender();

  // Fix (NEW-03): only products that are actually for sale. Home used
  // the raw list, so a product the admin had marked unavailable stayed
  // on the front page — and, via its card, stayed fully orderable.
  const sellable = products.filter((p) => p.available);

  // Fix (NEW-11): "Popular" and "Best Sellers" are demo curations by
  // product order. Taking the first 8 and the last 8 of the same list
  // made them overlap once the catalogue dropped below 16 products, so
  // the same gift appeared twice on one page under two different
  // claims. Best Sellers now takes from what Popular didn't use, and
  // only falls back to overlapping if there genuinely aren't enough
  // products to fill both.
  const popularGifts = sellable.slice(0, 8);
  const remainder = sellable.slice(8);
  const bestSellers =
    remainder.length >= 4 ? [...remainder].reverse().slice(0, 8) : [...sellable].reverse().slice(0, 8);

  return (
    <>
      <Hero />
      {!showBelowTheFold && (
        // Holds the page height for one tick so nothing jumps when the
        // real sections arrive. `aria-hidden` because it is a spacer,
        // not content; screen readers see the real sections a moment
        // later, and nobody can have scrolled here yet.
        <div style={{ minHeight: '100vh' }} aria-hidden="true" />
      )}
      {showBelowTheFold && productsError && (
        <div className="container">
          <DataLoadError
            message="We're having trouble loading the gift catalogue."
            onRetry={retryProducts}
            retrying={productsLoading}
          />
        </div>
      )}
      {showBelowTheFold && (
        <>
      <ProductShowcase
        title="Popular Gifts"
        description="Loved by customers across every occasion."
        products={popularGifts}
        loading={productsLoading}
      />
      <OffersSection products={sellable} offers={offers} />
      <ProductShowcase
        title="Best Sellers"
        description="The gifts people keep coming back for."
        products={bestSellers}
        tone="sunken"
        loading={productsLoading}
      />
      <WhyChooseUs />
      <ShopPreview />
      <CTASection />
        </>
      )}
    </>
  );
}
