import { useState } from 'react';
import ImageManagerField from './ImageManagerField';
import './ProductForm.css';

const emptyForm = {
  name: '',
  category: '',
  price: '',
  size: '',
  giftingPurpose: '',
  customizable: false,
  available: true,
  images: [],
  instagramUrl: '',
};

function productToFormState(product) {
  if (!product) return emptyForm;
  return {
    name: product.name || '',
    category: product.category || '',
    price: String(product.price ?? ''),
    size: product.size || '',
    giftingPurpose: (product.giftingPurpose || []).join(', '),
    customizable: Boolean(product.customizable),
    available: product.available !== false,
    images: product.images || [],
    instagramUrl: product.instagramUrl || '',
  };
}

function splitList(text) {
  return text
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function ProductForm({ product, categories, onSubmit, onCancel, saving = false }) {
  const [form, setForm] = useState(() => productToFormState(product));
  const [error, setError] = useState('');
  // Phase 10 QA fix: tracks whether ImageManagerField has an upload in
  // flight, so Save/Add can be disabled until it finishes — otherwise a
  // fast submit could save the product before the new image URL had
  // been added to form.images, silently dropping it with no error.
  const [imageUploading, setImageUploading] = useState(false);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (imageUploading) {
      setError('Please wait for the image upload to finish before saving.');
      return;
    }
    if (!form.name.trim() || !form.category.trim() || !form.price) {
      setError('Name, category, and price are required.');
      return;
    }
    if (form.images.length === 0) {
      setError('Add at least one product image.');
      return;
    }
    const instagramUrl = form.instagramUrl.trim();
    if (instagramUrl && !/^https?:\/\//i.test(instagramUrl)) {
      setError('Instagram link must start with http:// or https://');
      return;
    }

    onSubmit({
      name: form.name.trim(),
      category: form.category.trim(),
      description: product?.description || '',
      price: Number(form.price),
      size: form.size.trim(),
      tags: product?.tags || [],
      keywords: product?.keywords || [],
      productType: product?.productType || '',
      giftingPurpose: splitList(form.giftingPurpose),
      customizable: form.customizable,
      available: form.available,
      images: form.images,
      instagramUrl,
    });
  }

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <div className="product-form__row">
        <div className="product-form__field">
          <label htmlFor="pf-name">Product Name</label>
          <input id="pf-name" type="text" value={form.name} onChange={(e) => set('name', e.target.value)} />
        </div>
        <div className="product-form__field">
          <label htmlFor="pf-category">Category</label>
          <input
            id="pf-category"
            type="text"
            list="pf-category-list"
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
          />
          <datalist id="pf-category-list">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="product-form__row">
        <div className="product-form__field">
          <label htmlFor="pf-price">Price (₹)</label>
          <input id="pf-price" type="number" min="0" value={form.price} onChange={(e) => set('price', e.target.value)} />
        </div>
        <div className="product-form__field">
          <label htmlFor="pf-size">Size (optional — e.g. 8x10 inches)</label>
          <input
            id="pf-size"
            type="text"
            placeholder="e.g. 8x10 inches"
            value={form.size}
            onChange={(e) => set('size', e.target.value)}
          />
        </div>
      </div>

      <div className="product-form__field">
        <label htmlFor="pf-instagram">Instagram Link (optional)</label>
        <input
          id="pf-instagram"
          type="url"
          placeholder="https://www.instagram.com/p/..."
          value={form.instagramUrl}
          onChange={(e) => set('instagramUrl', e.target.value)}
        />
      </div>

      <div className="product-form__field">
        <label htmlFor="pf-gifting">Gifting Purpose (comma-separated)</label>
        <input
          id="pf-gifting"
          type="text"
          placeholder="e.g. Birthday, Anniversary"
          value={form.giftingPurpose}
          onChange={(e) => set('giftingPurpose', e.target.value)}
        />
      </div>

      <div className="product-form__checkboxes">
        <label>
          <input type="checkbox" checked={form.customizable} onChange={(e) => set('customizable', e.target.checked)} />
          Customizable
        </label>
        <label>
          <input type="checkbox" checked={form.available} onChange={(e) => set('available', e.target.checked)} />
          Available for sale
        </label>
      </div>

      <div className="product-form__field">
        <label>Product Images</label>
        <ImageManagerField
          images={form.images}
          onChange={(images) => set('images', images)}
          onUploadingChange={setImageUploading}
        />
      </div>

      {error && <p className="product-form__error">{error}</p>}

      <div className="product-form__actions">
        <button type="button" className="product-form__cancel" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        <button type="submit" className="product-form__submit" disabled={saving || imageUploading}>
          {imageUploading ? 'Uploading image…' : saving ? 'Saving…' : product ? 'Save Changes' : 'Add Product'}
        </button>
      </div>
    </form>
  );
}
