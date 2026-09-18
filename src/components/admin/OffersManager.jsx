import { useState } from 'react';
import OfferTable from './OfferTable';
import OfferForm from './OfferForm';
import ConfirmDialog from './ConfirmDialog';
import { useOffers } from '../../context/OffersContext';
import { useProducts } from '../../context/ProductsContext';
import { getCategories } from '../../utils/categories';
import './OffersManager.css';

export default function OffersManager() {
  const { offers, loading, error: loadError, addOffer, updateOffer, deleteOffer } = useOffers();
  const { products } = useProducts();
  const [formMode, setFormMode] = useState(null); // null | 'add' | offer object being edited
  const [pendingDelete, setPendingDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');

  const categories = getCategories(products).map((c) => c.name);

  async function handleSubmit(data) {
    setSaving(true);
    setActionError('');
    try {
      if (formMode && formMode !== 'add') {
        await updateOffer(formMode.id, data);
      } else {
        await addOffer(data);
      }
      setFormMode(null);
    } catch (err) {
      setActionError(err.message || 'Could not save this offer. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    setActionError('');
    try {
      await deleteOffer(pendingDelete.id);
      setPendingDelete(null);
    } catch (err) {
      setActionError(err.message || 'Could not delete this offer. Please try again.');
      setPendingDelete(null);
    }
  }

  if (loading) return <p className="offers-manager__status">Loading offers…</p>;
  if (loadError) return <p className="offers-manager__status offers-manager__status--error">Couldn’t load offers: {loadError}</p>;

  return (
    <div className="offers-manager">
      <div className="offers-manager__header">
        <h2>Offers ({offers.length})</h2>
        {!formMode && (
          <button type="button" className="offers-manager__add-btn" onClick={() => setFormMode('add')}>
            + Create Offer
          </button>
        )}
      </div>

      <p className="offers-manager__hint">
        An offer targets a specific product, an entire category, or all products — it only applies where you
        configure it, never automatically site-wide. Customers see the discount badge and price update live.
      </p>

      {actionError && <p className="offers-manager__status offers-manager__status--error">{actionError}</p>}

      {formMode && (
        <OfferForm
          offer={formMode === 'add' ? null : formMode}
          categories={categories}
          products={products}
          onSubmit={handleSubmit}
          onCancel={() => setFormMode(null)}
          saving={saving}
        />
      )}

      {!formMode && <OfferTable offers={offers} onEdit={setFormMode} onDelete={setPendingDelete} />}

      {pendingDelete && (
        <ConfirmDialog
          message={
            <>
              Delete <strong>{pendingDelete.name}</strong>? This can’t be undone.
            </>
          }
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
