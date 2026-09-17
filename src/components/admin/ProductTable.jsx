import { formatINR } from '../../utils/currency';
import { getOptimizedImageUrl } from '../../utils/cloudinaryImage';
import './ProductTable.css';

export default function ProductTable({ products, onEdit, onDelete }) {
  if (products.length === 0) {
    return <p className="product-table__empty">No products yet. Add your first one above.</p>;
  }

  return (
    <div className="product-table">
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Customizable</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>
                <img src={getOptimizedImageUrl(product.images[0], { width: 80 })} alt="" className="product-table__thumb" />
              </td>
              <td>{product.name}</td>
              <td>{product.category}</td>
              <td>{formatINR(product.price)}</td>
              <td>{product.customizable ? 'Yes' : 'No'}</td>
              <td>
                <span className={`product-table__status ${product.available ? 'product-table__status--live' : ''}`}>
                  {product.available ? 'Available' : 'Hidden'}
                </span>
              </td>
              <td className="product-table__actions">
                <button type="button" onClick={() => onEdit(product)}>
                  Edit
                </button>
                <button type="button" className="product-table__delete" onClick={() => onDelete(product)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
