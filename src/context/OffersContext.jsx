import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

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

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, COLLECTION),
      (snapshot) => {
        setOffers(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })));
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

  const addOffer = useCallback(async (data) => {
    const ref = await addDoc(collection(db, COLLECTION), data);
    return ref.id;
  }, []);

  const updateOffer = useCallback(async (id, updates) => {
    await updateDoc(doc(db, COLLECTION, id), updates);
  }, []);

  const deleteOffer = useCallback(async (id) => {
    await deleteDoc(doc(db, COLLECTION, id));
  }, []);

  const value = useMemo(
    () => ({ offers, loading, error, addOffer, updateOffer, deleteOffer }),
    [offers, loading, error, addOffer, updateOffer, deleteOffer]
  );

  return <OffersContext.Provider value={value}>{children}</OffersContext.Provider>;
}

export function useOffers() {
  const ctx = useContext(OffersContext);
  if (!ctx) throw new Error('useOffers must be used within an OffersProvider');
  return ctx;
}
