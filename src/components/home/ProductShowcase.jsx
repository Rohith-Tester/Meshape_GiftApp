import SectionHeading from '../ui/SectionHeading';
import ProductGrid from '../product/ProductGrid';
import { ROUTES } from '../../config/routes';
import './ProductShowcase.css';

/**
 * Fix (NEW-18): returning null while `products` was empty meant the
 * first paint jumped from the hero straight to the next section and
 * then reflowed once Firestore answered, shifting the page under the
 * customer. The section keeps its place while loading and only
 * disappears when there genuinely is nothing to show.
 */
export default function ProductShowcase({ title, description, products, tone = 'light', loading = false }) {
  if (products.length === 0 && !loading) return null;

  return (
    <section className={`section product-showcase product-showcase--${tone}`}>
      <div className="container">
        <SectionHeading title={title} description={description} linkTo={ROUTES.products} linkLabel="Shop all gifts" />
        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div className="product-showcase__skeleton" aria-hidden="true" />
        )}
      </div>
    </section>
  );
}
