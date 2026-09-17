import { useState } from 'react';
import ProductTable from './ProductTable';
import ProductForm from './ProductForm';
import ConfirmDialog from './ConfirmDialog';
import { useProducts } from '../../context/ProductsContext';
import { getCategories } from '../../utils/categories';
import './ProductsManager.css';

export default function ProductsManager() {
  const { products, loading, error: loadError, addProduct, updateProduct, deleteProduct } = useProducts();
  const [formMode, setFormMode] = useState(null); // null | 'add' | product object being edited
  const [pendingDelete, setPendingDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');

  const categories = getCategories(products).map((c) => c.name);

  async function handleSubmit(data) {
    setSaving(true);
    setActionError('');
    try {
      if (formMode && formMode !== 'add') {
        await updateProduct(formMode.id, data);
      } else {
        await addProduct(data);
      }
      setFormMode(null);
    } catch (err) {
      // Most likely cause: Firestore rejected the write because the
      // signed-in user doesn't carry the admin claim, or firestore.rules
      // hasn't been deployed yet — surfaced honestly rather than
      // pretending the save succeeded.
      setActionError(err.message || 'Could not save this product. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    setActionError('');
    try {
      await deleteProduct(pendingDelete.id);
      setPendingDelete(null);
    } catch (err) {
      setActionError(err.message || 'Could not delete this product. Please try again.');
      setPendingDelete(null);
    }
  }

  if (loading) return <p className="products-manager__status">Loading products…</p>;
  if (loadError) return <p className="products-manager__status products-manager__status--error">Couldn't load products: {loadError}</p>;

  return (
    <div className="products-manager">
      <div className="products-manager__header">
        <h2>Products ({products.length})</h2>
        {!formMode && (
          <button type="button" className="products-manager__add-btn" onClick={() => setFormMode('add')}>
            + Add Product
          </button>
        )}
      </div>

      {actionError && <p className="products-manager__status products-manager__status--error">{actionError}</p>}

      {formMode && (
        <ProductForm
          product={formMode === 'add' ? null : formMode}
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={() => setFormMode(null)}
          saving={saving}
        />
      )}

      {!formMode && <ProductTable products={products} onEdit={setFormMode} onDelete={setPendingDelete} />}

      {pendingDelete && (
        <ConfirmDialog
          message={
            <>
              Delete <strong>{pendingDelete.name}</strong>? This can't be undone.
            </>
          }
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
