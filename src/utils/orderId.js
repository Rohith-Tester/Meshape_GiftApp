/**
 * Generates order IDs in the form MS-YYYYMMDD-001, incrementing per
 * calendar day. Sequence numbers are tracked in localStorage so repeated
 * orders placed from this browser never collide.
 *
 * This is a DEMO-MODE uniqueness guarantee — it is unique per browser,
 * not globally across every customer's device. Phase 8 (backend) should
 * issue order IDs from a single server-side counter (or a database
 * auto-increment / UUID) so uniqueness holds across all customers.
 */

const STORAGE_KEY = 'meshape.orderSequence.v1';

function todayStamp(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

function readSequenceState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeSequenceState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // If storage fails, the ID below still works for this one order —
    // it just won't be remembered for collision-avoidance next time.
  }
}

/**
 * Four characters from an unambiguous alphabet — no O/0 or I/1, so the
 * shop owner can read an ID back over the phone without confusion.
 */
const SUFFIX_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomSuffix(length = 4) {
  const cryptoObj = typeof window !== 'undefined' ? window.crypto : undefined;
  const bytes = new Uint8Array(length);
  if (cryptoObj?.getRandomValues) {
    cryptoObj.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += SUFFIX_ALPHABET[bytes[i] % SUFFIX_ALPHABET.length];
  }
  return out;
}

/**
 * Fix (BUG-05): the per-browser counter alone meant every customer's
 * first order of the day was MS-YYYYMMDD-001, so two customers could
 * hold the same Order ID and the shop had no way to tell them apart.
 * A random suffix is appended, which makes a same-day collision
 * vanishingly unlikely (about 1 in a million per shared sequence
 * number) without needing a server.
 *
 * The date stamp and the per-browser sequence are both kept: they make
 * IDs readable and keep one customer's own orders in order. The suffix
 * is what makes them unique ACROSS customers — including the case where
 * a device's clock is wrong or crosses a timezone and the sequence
 * restarts on a date that has already been used.
 */
export function generateOrderId(date = new Date()) {
  const stamp = todayStamp(date);
  const stored = readSequenceState();

  // Security audit 2026-09-18 (SEC-07): `stored.seq` was trusted to be a
  // number. localStorage holds strings, so a value of "1" (from a hand-
  // edit, an extension, or a future format change) made this `"1" + 1`
  // === "11", and the order numbers the shop reads back would run 11,
  // 111, 1111. Falling back to 0 for anything that isn't a finite number
  // restarts the day's count instead of corrupting it.
  const storedSeq =
    stored && stored.stamp === stamp && Number.isFinite(stored.seq) ? stored.seq : 0;
  const nextSeq = storedSeq + 1;
  writeSequenceState({ stamp, seq: nextSeq });

  const seqText = String(nextSeq).padStart(3, '0');
  return `MS-${stamp}-${seqText}-${randomSuffix()}`;
}
