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

export function generateOrderId(date = new Date()) {
  const stamp = todayStamp(date);
  const stored = readSequenceState();

  const nextSeq = stored && stored.stamp === stamp ? stored.seq + 1 : 1;
  writeSequenceState({ stamp, seq: nextSeq });

  const seqText = String(nextSeq).padStart(3, '0');
  return `MS-${stamp}-${seqText}`;
}
