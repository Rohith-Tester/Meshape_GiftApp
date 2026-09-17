/**
 * Sample shop gallery. These are placeholder (picsum) photos, as required
 * by Master Specification section 23 & 39 — the owner will replace them
 * with real shop photos through Admin (section 24) once that exists in
 * Phase 6. The shape below (id, url, alt, category) is what Admin will
 * read/write, so this file can be swapped for an API response later
 * without changing `ShopGallery.jsx`.
 */
export const shopGallery = [
  { id: 'ext-1', url: 'https://picsum.photos/seed/meshape-exterior-1/1000/750', alt: 'MeShape Gift Shop storefront', category: 'Exterior' },
  { id: 'ext-2', url: 'https://picsum.photos/seed/meshape-exterior-2/1000/750', alt: 'MeShape Gift Shop entrance', category: 'Exterior' },
  { id: 'int-1', url: 'https://picsum.photos/seed/meshape-interior-1/1000/750', alt: 'Inside MeShape Gift Shop', category: 'Interior' },
  { id: 'int-2', url: 'https://picsum.photos/seed/meshape-interior-2/1000/750', alt: 'MeShape Gift Shop counter', category: 'Interior' },
  { id: 'int-3', url: 'https://picsum.photos/seed/meshape-interior-3/1000/750', alt: 'MeShape Gift Shop seating area', category: 'Interior' },
  { id: 'disp-1', url: 'https://picsum.photos/seed/meshape-display-1/1000/750', alt: 'Gift display shelf at MeShape', category: 'Product Display' },
  { id: 'disp-2', url: 'https://picsum.photos/seed/meshape-display-2/1000/750', alt: 'Personalized mugs on display', category: 'Product Display' },
  { id: 'disp-3', url: 'https://picsum.photos/seed/meshape-display-3/1000/750', alt: 'Gift hampers on display', category: 'Product Display' },
];

export default shopGallery;
