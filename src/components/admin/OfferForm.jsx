import { useState } from 'react';
import './OfferForm.css';

const emptyForm = {
  name: '',
  discountPercent: '',
  appliesTo: 'all',
  targetId: '',
  startDate: '',
  endDate: '',
  active: true,
};

function offerToFormState(offer) {
  if (!offer) return emptyForm;
  return {
    name: offer.name || '',
    discountPercent: String(offer.discountPercent ?? ''),
    appliesTo: offer.appliesTo || 'all',
    targetId: offer.targetId || '',
    startDate: offer.startDate || '',
    endDate: offer.endDate || '',
    active: offer.active !== false,
  };
}

export default function OfferForm({ offer, categories, products, onSubmit, onCancel, saving = false }) {
  const [form, setForm] = useState(() => offerToFormState(offer));
  const [error, setError] = useState('');

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value, ...(key === 'appliesTo' ? { targetId: '' } : {}) }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!form.name.trim()) return setError('Offer name is required.');
    const discount = Number(form.discountPercent);
    if (!discount || discount <= 0 || discount > 100) return setError('Discount must be a number between 1 and 100.');
    if (form.appliesTo !== 'all' && !form.targetId) {
      return setError(form.appliesTo === 'category' ? 'Choose a category.' : 'Choose a product.');
    }
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      return setError('End date must be on or after the start date.');
    }

    setError('');
    onSubmit({
      name: form.name.trim(),
      discountPercent: discount,
      appliesTo: form.appliesTo,
      targetId: form.appliesTo === 'all' ? null : form.targetId,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      active: form.active,
    });
  }

  return (
    <form className="offer-form" onSubmit={handleSubmit}>
      <div className="offer-form__row">
        <div className="offer-form__field">
          <label htmlFor="of-name">Offer Name</label>
          <input id="of-name" type="text" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Festival Sale" />
        </div>
        <div className="offer-form__field">
          <label htmlFor="of-discount">Discount Percentage</label>
          <input
            id="of-discount"
            type="number"
            min="1"
            max="100"
            value={form.discountPercent}
            onChange={(e) => set('discountPercent', e.target.value)}
          />
        </div>
      </div>

      <div className="offer-form__row">
        <div className="offer-form__field">
          <label htmlFor="of-applies">Apply To</label>
          <select id="of-applies" value={form.appliesTo} onChange={(e) => set('appliesTo', e.target.value)}>
            <option value="all">All Products</option>
            <option value="category">Entire Category</option>
            <option value="product">Specific Product</option>
          </select>
        </div>

        {form.appliesTo === 'category' && (
          <div className="offer-form__field">
            <label htmlFor="of-target-category">Category</label>
            <select id="of-target-category" value={form.targetId} onChange={(e) => set('targetId', e.target.value)}>
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        )}

        {form.appliesTo === 'product' && (
          <div className="offer-form__field">
            <label htmlFor="of-target-product">Product</label>
            <select id="of-target-product" value={form.targetId} onChange={(e) => set('targetId', e.target.value)}>
              <option value="">Select a product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="offer-form__row">
        <div className="offer-form__field">
          <label htmlFor="of-start">Start Date</label>
          <input id="of-start" type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
        </div>
        <div className="offer-form__field">
          <label htmlFor="of-end">End Date</label>
          <input id="of-end" type="date" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} />
        </div>
      </div>

      <label className="offer-form__active-toggle">
        <input type="checkbox" checked={form.active} onChange={(e) => set('active', e.target.checked)} />
        Active
      </label>

      {error && <p className="offer-form__error">{error}</p>}

      <div className="offer-form__actions">
        <button type="button" className="offer-form__cancel" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        <button type="submit" className="offer-form__submit" disabled={saving}>
          {saving ? 'Saving…' : offer ? 'Save Changes' : 'Create Offer'}
        </button>
      </div>
    </form>
  );
}
