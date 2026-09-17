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

export default function Home() {
  useDocumentHead({
    title: 'Personalized & Premium Gifts',
    description:
      'MeShape Gift Shop — personalized mugs, lamps, keychains, cushions and gift hampers. Order online for pickup or delivery across India.',
  });

  const { products, error: productsError } = useProducts();
  const { offers } = useOffers();
  // "Popular" and "Best Sellers" are demo curations by product order —
  // Phase 6 Admin can eventually flag these explicitly per product.
  const popularGifts = products.slice(0, 8);
  const bestSellers = [...products].reverse().slice(0, 8);

  return (
    <>
      <Hero />
      {productsError && (
        <div className="container">
          <DataLoadError message="We're having trouble loading the gift catalogue." />
        </div>
      )}
      <ProductShowcase
        title="Popular Gifts"
        description="Loved by customers across every occasion."
        products={popularGifts}
      />
      <OffersSection products={products} offers={offers} />
      <ProductShowcase
        title="Best Sellers"
        description="The gifts people keep coming back for."
        products={bestSellers}
        tone="sunken"
      />
      <WhyChooseUs />
      <ShopPreview />
      <CTASection />
    </>
  );
}
