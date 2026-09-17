import ShopGallery from '../components/shop/ShopGallery';
import ShopInfoPanel from '../components/shop/ShopInfoPanel';
import DataLoadError from '../components/ui/DataLoadError';
import { useShopGallery } from '../context/ShopGalleryContext';
import { useDocumentHead } from '../hooks/useDocumentHead';
import './Shop.css';

export default function Shop() {
  useDocumentHead({
    title: 'Our Shop',
    description: 'Visit MeShape Gift Shop on Vandavasi–Acharapakkam Road — see photos, hours, and get directions.',
  });

  const { photos, error: galleryError } = useShopGallery();

  return (
    <div className="section shop-page">
      <div className="container">
        <div className="shop-page__intro">
          <h1>Our Shop</h1>
          <p>
            Step into MeShape Gift Shop — a warm, welcoming space on the Vandavasi–Acharapakkam Road where every
            shelf is arranged to help you find the right gift, faster. Browse personalized mugs, lamps, cushions and
            hampers in person, or place an order online for pickup or delivery.
          </p>
        </div>

        {galleryError && <DataLoadError message="We're having trouble loading the shop gallery." />}

        <div className="shop-page__grid">
          <ShopGallery photos={photos} />
          <ShopInfoPanel />
        </div>
      </div>
    </div>
  );
}
