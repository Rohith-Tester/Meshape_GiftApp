import { useMemo, useState } from 'react';
import ImageLightbox from './ImageLightbox';
import { getOptimizedImageUrl } from '../../utils/cloudinaryImage';
import './ShopGallery.css';

export default function ShopGallery({ photos }) {
  const categories = useMemo(() => ['All', ...new Set(photos.map((p) => p.category))], [photos]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const filtered = activeCategory === 'All' ? photos : photos.filter((p) => p.category === activeCategory);

  return (
    <div className="shop-gallery">
      <div className="shop-gallery__filters" role="tablist" aria-label="Filter gallery by area">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={activeCategory === cat}
            className={`shop-gallery__filter ${activeCategory === cat ? 'shop-gallery__filter--active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="shop-gallery__grid">
        {filtered.map((photo, i) => (
          <button
            type="button"
            key={photo.id}
            className="shop-gallery__tile"
            onClick={() => setLightboxIndex(i)}
            aria-label={`View larger image: ${photo.alt}`}
          >
            <img src={getOptimizedImageUrl(photo.url, { width: 700 })} alt={photo.alt} loading="lazy" />
            <span className="shop-gallery__tile-label">{photo.category}</span>
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <ImageLightbox images={filtered} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onNavigate={setLightboxIndex} />
      )}
    </div>
  );
}
