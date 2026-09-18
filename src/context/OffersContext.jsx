import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { loadFirestore } from '../lib/firebase';
import { fetchCollectionOnce } from '../lib/firestoreRest';

const OffersContext = createContext(null);
const COLLECTION = 'offers';

/**
 * Same architecture and same security model as ProductsContext: reads
 * are public (firestore.rules allows anyone to read /offers/{offerId} so
 * prices compute correctly for anonymous shoppers), writes require the
 * `admin` custom claim and are enforced server-side, not by this file.
 */
export function OffersProvider({ children }) {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Fix (BUG-17): bumping this re-runs the effect below, which
  // tears down the failed listener and subscribes again — giving
  // DataLoadError a genuine retry instead of only telling the
  // customer to reload the whole page themselves.
  const [retryToken, setRetryToken] = useState(0);

  const retry = useCallback(() => {
    setError(null);
    setLoading(true);
    setRetryToken((n) => n + 1);
  }, []);

  // Firestore is loaded on demand rather than imported statically, so it
  // no longer blocks first paint (NEW-23) — see src/lib/firebase.js.
  useEffect(() => {
    let cancelled = false;
    let unsubscribe = null;
    // Set as soon as the SDK delivers a snapshot. The REST read below is
    // only a head start; once the SDK is live it owns the data, and a
    // slower REST response must never overwrite it.
    let sdkHasDelivered = false;
    const restAbort = new AbortController();

    // A plain HTTPS read that needs no SDK, so it can go out while the
    // SDK chunk is still downloading — this is what lets the first
    // product photos start loading about a second earlier (NEW-23).
    // A failure here is not an error state: the SDK is still coming.
    fetchCollectionOnce(COLLECTION, { signal: restAbort.signal })
      .then((docs) => {
        if (cancelled || sdkHasDelivered) return;
        setOffers(docs);
        setLoading(false);
      })
      .catch(() => {
        /* Ignored by design — see src/lib/firestoreRest.js. */
      });

    loadFirestore()
      .then(({ db, fs }) => {
        if (cancelled) return;
        unsubscribe = fs.onSnapshot(
          fs.collection(db, COLLECTION),
          (snapshot) => {
            sdkHasDelivered = true;
            setOffers(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })));
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
      restAbort.abort();
      if (unsubscribe) unsubscribe();
    };
  }, [retryToken]);

  const addOffer = useCallback(async (data) => {
    const { db, fs } = await loadFirestore();
    const ref = await fs.addDoc(fs.collection(db, COLLECTION), data);
    return ref.id;
  }, []);

  const updateOffer = useCallback(async (id, updates) => {
    const { db, fs } = await loadFirestore();
    await fs.updateDoc(fs.doc(db, COLLECTION, id), updates);
  }, []);

  const deleteOffer = useCallback(async (id) => {
    const { db, fs } = await loadFirestore();
    await fs.deleteDoc(fs.doc(db, COLLECTION, id));
  }, []);

  const value = useMemo(
    () => ({ offers, loading, error, retry, addOffer, updateOffer, deleteOffer }),
    [offers, loading, error, retry, addOffer, updateOffer, deleteOffer]
  );

  return <OffersContext.Provider value={value}>{children}</OffersContext.Provider>;
}

export function useOffers() {
  const ctx = useContext(OffersContext);
  if (!ctx) throw new Error('useOffers must be used within an OffersProvider');
  return ctx;
}
