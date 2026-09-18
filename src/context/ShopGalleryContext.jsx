import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { loadFirestore } from '../lib/firebase';
import { safeImageUrl } from '../utils/safeUrl';

const ShopGalleryContext = createContext(null);
// A single document (rather than one document per photo) because the
// gallery is small (a few dozen photos at most) and reordering needs to
// write the whole ordered list atomically — Firestore has no native
// "move this array item" operation.
const GALLERY_PATH = ['settings', 'shopGallery'];

/**
 * Security audit 2026-09-18 (SEC-04/SEC-05): the rule for
 * settings/{docId} authorizes WHO may write but validates nothing about
 * WHAT is written — and it cannot, because the gallery is an array of
 * objects and Firestore rules have no way to iterate a list. Whatever is
 * in `photos` reaches an <img src> on the public Shop page unchecked.
 *
 * Sanitizing on read makes this the one place every consumer
 * (ShopGallery, ImageLightbox, ShopGalleryManager) inherits the check
 * from. Entries whose url is not a plain http(s) or same-origin URL are
 * dropped rather than rendered; `alt` is clamped so a pathological
 * string cannot be used to stuff the accessibility tree.
 */
function sanitizePhotos(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((photo) => photo && typeof photo === 'object')
    .map((photo) => ({ ...photo, url: safeImageUrl(photo.url) }))
    .filter((photo) => photo.url !== null)
    .map((photo) => ({
      ...photo,
      alt: typeof photo.alt === 'string' ? photo.alt.slice(0, 200) : '',
    }));
}

export function ShopGalleryProvider({ children }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Firestore is loaded on demand rather than imported statically, so it
  // no longer blocks first paint (NEW-23) — see src/lib/firebase.js.
  useEffect(() => {
    let cancelled = false;
    let unsubscribe = null;

    loadFirestore()
      .then(({ db, fs }) => {
        if (cancelled) return;
        unsubscribe = fs.onSnapshot(
          fs.doc(db, ...GALLERY_PATH),
          (snapshot) => {
            setPhotos(snapshot.exists() ? sanitizePhotos(snapshot.data().photos) : []);
            setLoading(false);
            setError(null);
          },
          (err) => {
            setError(err.message);
            setLoading(false);
          }
        );
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setLoading(false);
      });

    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // `merge: true` so this also works the very first time, before the
  // settings/shopGallery document exists at all.
  const writePhotos = useCallback(async (nextPhotos) => {
    const { db, fs } = await loadFirestore();
    await fs.setDoc(fs.doc(db, ...GALLERY_PATH), { photos: nextPhotos }, { merge: true });
  }, []);

  const addPhoto = useCallback(
    async (photo) => {
      await writePhotos([...photos, { ...photo, id: `photo-${Date.now()}` }]);
    },
    [photos, writePhotos]
  );

  const removePhoto = useCallback(
    async (id) => {
      await writePhotos(photos.filter((p) => p.id !== id));
    },
    [photos, writePhotos]
  );

  const movePhoto = useCallback(
    async (id, direction) => {
      const index = photos.findIndex((p) => p.id === id);
      const swapWith = index + direction;
      if (index === -1 || swapWith < 0 || swapWith >= photos.length) return;
      const next = [...photos];
      [next[index], next[swapWith]] = [next[swapWith], next[index]];
      await writePhotos(next);
    },
    [photos, writePhotos]
  );

  const value = useMemo(
    () => ({ photos, loading, error, addPhoto, removePhoto, movePhoto }),
    [photos, loading, error, addPhoto, removePhoto, movePhoto]
  );

  return <ShopGalleryContext.Provider value={value}>{children}</ShopGalleryContext.Provider>;
}

export function useShopGallery() {
  const ctx = useContext(ShopGalleryContext);
  if (!ctx) throw new Error('useShopGallery must be used within a ShopGalleryProvider');
  return ctx;
}
