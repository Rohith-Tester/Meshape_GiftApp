import { useState } from 'react';
import ImageManagerField from './ImageManagerField';
import './ProductForm.css';

const emptyForm = {
  name: '',
  category: '',
  price: '',
  // Fix (BUG-10): there was no description input at all, and
  // handleSubmit wrote `description: product?.description || ''`, so a
  // description could never be set from the admin UI. Every product
  // shipped with an empty one — which is why no product page showed a
  // description, description search could never match, and product
  // pages fell back to a wrong meta description (BUG-08).
  description: '',
  tags: '',
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
    description: product.description || '',
    tags: (product.tags || []).join(', '),
    size: product.size || '',
    giftingPurpose: (product.giftingPurpose || []).join(', '),
    customizable: Boolean(product.customizable),
    available: product.available !== false,
    images: product.images || [],
    instagramUrl: product.instagramUrl || '',
  };
}

/**
 * Fix (NEW-08): the category field is free text with a datalist, and
 * filtering matches it exactly. "Frames" and "frames" therefore became
 * two separate categories that look identical on screen, because the
 * card CSS capitalises them — silently splitting the catalogue in two.
 * A typed category is now matched case-insensitively against the ones
 * that already exist, and the existing spelling wins.
 */
function normalizeCategory(value, categories) {
  const trimmed = value.trim().replace(/\s+/g, ' ');
  if (!trimmed) return '';
  const existing = categories.find((c) => c.toLowerCase() === trimmed.toLowerCase());
  return existing || trimmed;
}

function splitList(text) {
  return text
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Milliseconds value of a Firestore Timestamp, Date, or anything else. */
function toMillis(value) {
  if (!value) return 0;
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (value instanceof Date) return value.getTime();
  if (typeof value.seconds === 'number') return value.seconds * 1000;
  return 0;
}

export default function ProductForm({ product, categories, liveProduct, onSubmit, onCancel, saving = false }) {
  const [form, setForm] = useState(() => productToFormState(product));
  const [error, setError] = useState('');
  // Snapshot of the document's updatedAt at the moment this form opened.
  const [openedAt] = useState(() => toMillis(product?.updatedAt));
  const [overwriteConfirmed, setOverwriteConfirmed] = useState(false);

  /**
   * Fix (NEW-21): this form submits the WHOLE document, not a diff. With
   * two admins editing the same product, the second one to save wrote
   * back every stale field their form was holding — silently reverting
   * the first admin's changes to fields they never touched. (Observed:
   * window A renamed a product, window B changed only the price, and
   * the rename was undone with no warning to either of them.)
   *
   * ProductsContext keeps a live onSnapshot listener, so we can see the
   * document change underneath us and say so before anything is lost.
   */
  const liveUpdatedAt = toMillis(liveProduct?.updatedAt);
  const changedElsewhere = Boolean(product) && openedAt > 0 && liveUpdatedAt > openedAt;
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
    if (changedElsewhere && !overwriteConfirmed) {
      setError(
        'Someone else changed this product while you had it open. Review the warning above before saving.'
      );
      return;
    }
    if (!form.name.trim() || !form.category.trim() || !form.price) {
      setError('Name, category, and price are required.');
      return;
    }
    /**
     * Fix (BUG-13): the check above is only a truthiness test, and the
     * price arrives from the input as the STRING "0", which is truthy in
     * JavaScript. A zero-rupee product therefore saved without an error
     * and went live on the storefront listed at ₹0, fully orderable.
     * Negative and fractional values were only ever blocked by the
     * browser's own min/step attributes, which any non-form write
     * bypasses. Validate the actual number here.
     */
    const priceValue = Number(form.price);
    if (!Number.isFinite(priceValue) || priceValue <= 0) {
      setError('Price must be a number greater than 0.');
      return;
    }
    if (!Number.isInteger(priceValue)) {
      setError('Price must be a whole number of rupees.');
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
      category: normalizeCategory(form.category, categories),
      description: form.description.trim(),
      price: priceValue,
      size: form.size.trim(),
      tags: splitList(form.tags),
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
      {changedElsewhere && (
        <div className="product-form__conflict" role="alert">
          <p>
            <strong>Heads up:</strong> another admin saved changes to this product while you had it open.
            Saving now will replace their version with everything on this form, including fields you haven’t
            touched.
          </p>
          <div className="product-form__conflict-actions">
            <button type="button" onClick={() => setForm(productToFormState(liveProduct))}>
              Load their version
            </button>
            <label className="product-form__conflict-confirm">
              <input
                type="checkbox"
                checked={overwriteConfirmed}
                onChange={(e) => setOverwriteConfirmed(e.target.checked)}
              />
              Save mine anyway
            </label>
          </div>
        </div>
      )}

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
          <input id="pf-price" type="number" min="1" step="1" value={form.price} onChange={(e) => set('price', e.target.value)} />
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

      {/* Fix (BUG-10): descriptions were previously unreachable from the
          admin UI, so every product had an empty one. This drives the
          product page copy, description search and the page's meta
          description. */}
      <div className="product-form__field">
        <label htmlFor="pf-description">Description</label>
        <textarea
          id="pf-description"
          rows={4}
          placeholder="What makes this gift special, what it's made of, what can be personalized…"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
        />
      </div>

      <div className="product-form__field">
        <label htmlFor="pf-tags">Tags (comma-separated, helps customers find this gift)</label>
        <input
          id="pf-tags"
          type="text"
          placeholder="e.g. lamp, wooden, engraved"
          value={form.tags}
          onChange={(e) => set('tags', e.target.value)}
        />
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
