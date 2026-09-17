import { useProducts } from '../../context/ProductsContext';
import { useShopGallery } from '../../context/ShopGalleryContext';
import { useOffers } from '../../context/OffersContext';
import { getActiveOfferForProduct, getOfferStatus } from '../../utils/pricing';
import './DashboardOverview.css';

export default function DashboardOverview() {
  const { products, loading: productsLoading } = useProducts();
  const { photos } = useShopGallery();
  const { offers, loading: offersLoading } = useOffers();

  if (productsLoading || offersLoading) {
    return <p className="dashboard-overview__status">Loading dashboard…</p>;
  }

  const activeOfferCount = offers.filter((o) => getOfferStatus(o) === 'active').length;
  const discountedProductCount = products.filter((p) => getActiveOfferForProduct(p, offers)).length;
  const hiddenProductCount = products.filter((p) => !p.available).length;

  const stats = [
    { label: 'Total Products', value: products.length },
    { label: 'Products On Offer', value: discountedProductCount },
    { label: 'Hidden / Out of Stock', value: hiddenProductCount },
    { label: 'Active Offers', value: activeOfferCount },
    { label: 'Shop Gallery Photos', value: photos.length },
  ];

  return (
    <div className="dashboard-overview">
      <h2>Dashboard</h2>
      <div className="dashboard-overview__grid">
        {stats.map((stat) => (
          <div className="dashboard-overview__card" key={stat.label}>
            <p className="dashboard-overview__value">{stat.value}</p>
            <p className="dashboard-overview__label">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
