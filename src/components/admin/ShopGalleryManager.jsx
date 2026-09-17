import { useState } from 'react';
import { useShopGallery } from '../../context/ShopGalleryContext';
import { validateImageFile } from '../../utils/validation';
import { uploadToCloudinary } from '../../utils/cloudinaryUpload';
import { getOptimizedImageUrl } from '../../utils/cloudinaryImage';
import './ShopGalleryManager.css';

const CATEGORY_OPTIONS = ['Exterior', 'Interior', 'Product Display'];

export default function ShopGalleryManager() {
  const { photos, addPhoto, removePhoto, movePhoto } = useShopGallery();
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [alt, setAlt] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const { valid, error: validationError } = validateImageFile(file);
    if (!valid) {
      setError(validationError);
      return;
    }

    setError('');
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      await addPhoto({ url, alt: alt.trim() || `${category} photo`, category });
      setAlt('');
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove(id) {
    setError('');
    try {
      await removePhoto(id);
    } catch (err) {
      setError(err.message || 'Could not remove this photo. Please try again.');
    }
  }

  async function handleMove(id, direction) {
    setError('');
    try {
      await movePhoto(id, direction);
    } catch (err) {
      setError(err.message || 'Could not reorder photos. Please try again.');
    }
  }

  return (
    <div className="shop-gallery-manager">
      <h2>Shop Gallery ({photos.length} photos)</h2>

      <div className="shop-gallery-manager__add">
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input type="text" placeholder="Photo description (optional)" value={alt} onChange={(e) => setAlt(e.target.value)} />
        <label className="shop-gallery-manager__upload-btn">
          {uploading ? 'Uploading…' : 'Upload Photo'}
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={uploading}
            hidden
          />
        </label>
      </div>
      {error && <p className="shop-gallery-manager__error">{error}</p>}

      <div className="shop-gallery-manager__grid">
        {photos.map((photo, index) => (
          <div className="shop-gallery-manager__item" key={photo.id}>
            <img src={getOptimizedImageUrl(photo.url, { width: 300 })} alt={photo.alt} />
            <p className="shop-gallery-manager__item-category">{photo.category}</p>
            <div className="shop-gallery-manager__item-controls">
              <button type="button" onClick={() => handleMove(photo.id, -1)} disabled={index === 0} aria-label="Move earlier">
                ←
              </button>
              <button type="button" className="shop-gallery-manager__remove" onClick={() => handleRemove(photo.id)}>
                Remove
              </button>
              <button
                type="button"
                onClick={() => handleMove(photo.id, 1)}
                disabled={index === photos.length - 1}
                aria-label="Move later"
              >
                →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
