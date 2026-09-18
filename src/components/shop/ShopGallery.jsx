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
            id={`gallery-tab-${cat.replace(/\s+/g, '-').toLowerCase()}`}
            aria-selected={activeCategory === cat}
            aria-controls="gallery-panel"
            tabIndex={activeCategory === cat ? 0 : -1}
            className={`shop-gallery__filter ${activeCategory === cat ? 'shop-gallery__filter--active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Fix (NEW-16): role="tablist"/"tab" were declared with no
          tabpanel and no aria-controls, so the relationship the roles
          promised did not exist for assistive technology. */}
      <div
        className="shop-gallery__grid"
        id="gallery-panel"
        role="tabpanel"
        aria-label={`${activeCategory} photos`}
      >
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
