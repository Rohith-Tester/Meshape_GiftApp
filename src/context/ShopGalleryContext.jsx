import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const ShopGalleryContext = createContext(null);
// A single document (rather than one document per photo) because the
// gallery is small (a few dozen photos at most) and reordering needs to
// write the whole ordered list atomically — Firestore has no native
// "move this array item" operation.
const GALLERY_DOC = doc(db, 'settings', 'shopGallery');

export function ShopGalleryProvider({ children }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      GALLERY_DOC,
      (snapshot) => {
        setPhotos(snapshot.exists() ? snapshot.data().photos || [] : []);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  // `merge: true` so this also works the very first time, before the
  // settings/shopGallery document exists at all.
  const writePhotos = useCallback(async (nextPhotos) => {
    await setDoc(GALLERY_DOC, { photos: nextPhotos }, { merge: true });
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
