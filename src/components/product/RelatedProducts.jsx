import SectionHeading from '../ui/SectionHeading';
import ProductGrid from './ProductGrid';

export default function RelatedProducts({ products }) {
  if (products.length === 0) return null;

  return (
    <section className="section">
      <SectionHeading title="You Might Also Like" description="Picked to match this gift's category and purpose." />
      <ProductGrid products={products} />
    </section>
  );
}
