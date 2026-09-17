/**
 * Inserts Cloudinary's f_auto,q_auto transformation into a Cloudinary
 * delivery URL so the browser receives the smallest well-supported
 * format (WebP/AVIF where possible) at an automatically chosen quality
 * — a real, free performance win for every image Admin uploads (Phase 8),
 * with no extra dependency or build step.
 *
 * Safe no-op for anything that isn't a Cloudinary URL (the demo catalogue
 * still uses picsum.photos placeholder images) — this never breaks or
 * rewrites a URL it doesn't recognize.
 *
 * `width` is optional and adds a responsive resize (`w_<n>`) — useful for
 * thumbnails (search suggestions, cart lines) that never need a
 * full-resolution image.
 */
export function getOptimizedImageUrl(url, { width } = {}) {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) {
    return url;
  }

  const transforms = ['f_auto', 'q_auto'];
  if (width) transforms.push(`w_${width}`);

  return url.replace('/upload/', `/upload/${transforms.join(',')}/`);
}
