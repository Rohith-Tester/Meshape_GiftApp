import SectionHeading from '../ui/SectionHeading';
import ProductGrid from '../product/ProductGrid';
import { ROUTES } from '../../config/routes';
import './ProductShowcase.css';

export default function ProductShowcase({ title, description, products, tone = 'light' }) {
  if (products.length === 0) return null;

  return (
    <section className={`section product-showcase product-showcase--${tone}`}>
      <div className="container">
        <SectionHeading title={title} description={description} linkTo={ROUTES.products} linkLabel="Shop all gifts" />
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
