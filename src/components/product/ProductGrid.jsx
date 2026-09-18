import ProductCard from './ProductCard';
import './ProductGrid.css';

/**
 * How many cards are treated as above-the-fold and load their image
 * eagerly (see ProductCard's `priority` prop). The grid is one column on
 * a phone and up to four on a wide screen, so four covers the first
 * visible row at every breakpoint without eagerly fetching a long tail
 * of images nobody has scrolled to (NEW-23).
 */
const PRIORITY_CARDS = 4;

export default function ProductGrid({ products }) {
  return (
    <div className="product-grid">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < PRIORITY_CARDS} />
      ))}
    </div>
  );
}
