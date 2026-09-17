import { useEffect } from 'react';
import { getOptimizedImageUrl } from '../../utils/cloudinaryImage';
import './ImageLightbox.css';

export default function ImageLightbox({ images, index, onClose, onNavigate }) {
  const image = images[index];

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNavigate((index + 1) % images.length);
      if (e.key === 'ArrowLeft') onNavigate((index - 1 + images.length) % images.length);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [index, images.length, onClose, onNavigate]);

  if (!image) return null;

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={image.alt} onMouseDown={onClose}>
      <button type="button" className="lightbox__close" onClick={onClose} aria-label="Close">
        ×
      </button>

      {images.length > 1 && (
        <button
          type="button"
          className="lightbox__nav lightbox__nav--prev"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate((index - 1 + images.length) % images.length);
          }}
          aria-label="Previous image"
        >
          ‹
        </button>
      )}

      <img
        src={getOptimizedImageUrl(image.url, { width: 1000 })}
        alt={image.alt}
        className="lightbox__image"
        onMouseDown={(e) => e.stopPropagation()}
      />

      {images.length > 1 && (
        <button
          type="button"
          className="lightbox__nav lightbox__nav--next"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate((index + 1) % images.length);
          }}
          aria-label="Next image"
        >
          ›
        </button>
      )}

      <p className="lightbox__caption">{image.alt}</p>
    </div>
  );
}
