import { useState } from 'react';
import { validateImageFile } from '../../utils/validation';
import { uploadToCloudinary } from '../../utils/cloudinaryUpload';
import { getOptimizedImageUrl } from '../../utils/cloudinaryImage';
import './ImageManagerField.css';

/**
 * `images` is a plain array of URLs — real Cloudinary secure_urls now
 * (previously base64 data URLs stuffed into localStorage in Phase 6/7).
 * See src/utils/cloudinaryUpload.js for the unsigned-upload security
 * tradeoff this relies on.
 *
 * `onUploadingChange` (Phase 10 QA fix): notifies the parent form when an
 * upload starts/finishes, so it can disable its Save/Add button while
 * true. Without this, an admin could submit the product form while a
 * Cloudinary upload was still in flight — the image hadn't been added to
 * `images` yet at that point, so it would silently never make it onto
 * the saved product, with no error or indication anything was lost.
 */
export default function ImageManagerField({ images, onChange, onUploadingChange }) {
  const [urlInput, setUrlInput] = useState('');
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
    onUploadingChange?.(true);
    try {
      const url = await uploadToCloudinary(file);
      onChange([...images, url]);
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
    }
  }

  /**
   * Fix (NEW-07): this accepted ANY string with no validation at all,
   * so pasting a URL bypassed every rule that validateImageFile applies
   * to uploads — the JPG/PNG/WEBP restriction and the 5MB ceiling — and
   * a typo silently became a permanently broken product image with no
   * feedback. We now require a real http(s) URL that points at an
   * allowed image type (or at Cloudinary, whose delivery URLs carry
   * transformations rather than a plain extension).
   */
  function handleAddUrl() {
    const raw = urlInput.trim();
    if (!raw) return;

    let parsed;
    try {
      parsed = new URL(raw);
    } catch {
      setError('Enter a full image URL, starting with https://');
      return;
    }
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      setError('Enter a full image URL, starting with https://');
      return;
    }

    const path = parsed.pathname.toLowerCase();
    const looksLikeImage = ['.jpg', '.jpeg', '.png', '.webp'].some((ext) => path.endsWith(ext));
    const isCloudinary = parsed.hostname === 'res.cloudinary.com';
    if (!looksLikeImage && !isCloudinary) {
      setError('The link must point to a JPG, PNG, or WEBP image.');
      return;
    }

    if (images.includes(raw)) {
      setError('That image is already on this product.');
      return;
    }

    setError('');
    onChange([...images, raw]);
    setUrlInput('');
  }

  function handleRemove(index) {
    onChange(images.filter((_, i) => i !== index));
  }

  function handleMove(index, direction) {
    const swapWith = index + direction;
    if (swapWith < 0 || swapWith >= images.length) return;
    const next = [...images];
    [next[index], next[swapWith]] = [next[swapWith], next[index]];
    onChange(next);
  }

  return (
    <div className="image-manager">
      {images.length > 0 && (
        <div className="image-manager__grid">
          {/* Fix (NEW-14): keyed by index on a list whose whole purpose
              is reordering and removal, which made React reuse the wrong
              nodes when images moved. The URL is the stable identity. */}
          {images.map((src, index) => (
            <div className="image-manager__item" key={src}>
              <img src={getOptimizedImageUrl(src, { width: 240 })} alt={`Image ${index + 1}`} />
              <div className="image-manager__item-controls">
                <button type="button" onClick={() => handleMove(index, -1)} disabled={index === 0} aria-label="Move earlier">
                  ←
                </button>
                <button type="button" onClick={() => handleRemove(index)} className="image-manager__remove" aria-label="Remove image">
                  Remove
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(index, 1)}
                  disabled={index === images.length - 1}
                  aria-label="Move later"
                >
                  →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="image-manager__add-row">
        <label className="image-manager__upload-btn">
          {uploading ? 'Uploading…' : 'Upload Image'}
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={uploading}
            hidden
          />
        </label>

        <div className="image-manager__url-add">
          <input
            type="text"
            placeholder="Or paste an image URL"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
          />
          <button type="button" onClick={handleAddUrl}>
            Add
          </button>
        </div>
      </div>

      {error && <p className="image-manager__error">{error}</p>}
    </div>
  );
}
