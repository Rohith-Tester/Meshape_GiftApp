/**
 * A dependency-free first read of Firestore over its REST API (NEW-23).
 *
 * WHY THIS EXISTS
 * ---------------
 * Product photos are the Largest Contentful Paint element on the
 * catalogue and product pages, and their URLs live in Firestore. With
 * only the SDK, the browser cannot request the first photo until it has:
 * downloaded the app, mounted React, downloaded the 176 kB (gzipped)
 * Firestore SDK chunk, opened a connection and received a snapshot.
 * Lighthouse measured that as roughly 1.2 s of "resource load delay"
 * before the image request was even made.
 *
 * Firestore also answers a plain HTTPS GET. That request needs no SDK,
 * so it can go out as soon as the app's own (much smaller) bundle runs,
 * in parallel with the SDK still downloading. The page paints from
 * whichever arrives first.
 *
 * WHAT THIS IS NOT
 * ----------------
 * This does not replace the SDK. `onSnapshot` still attaches and still
 * drives everything afterwards, so live updates from the admin
 * dashboard behave exactly as before — this only fills the gap before
 * the first snapshot arrives, and the SDK overwrites whatever it put
 * there. If this request fails for any reason the app is unaffected:
 * the callers ignore the error and wait for the SDK, which is the
 * behaviour they had before this file existed.
 *
 * SECURITY
 * --------
 * Same door, same lock. These reads go through the same Firestore
 * Security Rules as the SDK's (`allow read: if true` on /products and
 * /offers — see firestore.rules), and the API key in the URL is the
 * public Firebase web key that already ships in the bundle. A collection
 * whose rules do not permit public reads returns 403 here exactly as it
 * would through the SDK.
 *
 * COST
 * ----
 * This is a second read of the same documents, so a first-ever visit
 * bills roughly twice the document reads it used to. For this catalogue
 * that is about 34 reads instead of 17, against a free-tier allowance of
 * 50,000 a day. Repeat visits are served by the SDK's IndexedDB cache
 * and are unaffected.
 */

const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

const BASE = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

/**
 * Firestore's REST format tags every value with its type — `{"price":
 * {"integerValue":"199"}}` rather than `{"price":199}`. This turns one
 * tagged value back into the plain JavaScript the app expects, matching
 * what the SDK hands back.
 */
function decodeValue(value) {
  if (!value || typeof value !== 'object') return null;
  if ('stringValue' in value) return value.stringValue;
  if ('booleanValue' in value) return value.booleanValue;
  // Firestore sends 64-bit integers as strings so they survive JSON.
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  // A Date, not a Firestore Timestamp. The only code that reads these
  // (admin/ProductForm.jsx's toMillis) already accepts either.
  if ('timestampValue' in value) return new Date(value.timestampValue);
  if ('nullValue' in value) return null;
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(decodeValue);
  if ('mapValue' in value) return decodeFields(value.mapValue.fields);
  if ('geoPointValue' in value) return value.geoPointValue;
  if ('referenceValue' in value) return value.referenceValue;
  if ('bytesValue' in value) return value.bytesValue;
  return null;
}

function decodeFields(fields) {
  const out = {};
  for (const [key, value] of Object.entries(fields || {})) out[key] = decodeValue(value);
  return out;
}

/**
 * The document id is the last path segment of its full resource name,
 * which is what the SDK exposes as `docSnap.id`.
 */
function decodeDocument(doc) {
  const id = doc.name.slice(doc.name.lastIndexOf('/') + 1);
  return { id, ...decodeFields(doc.fields) };
}

/** True only if this build has the configuration a REST read needs. */
export function canFetchOverRest() {
  return Boolean(projectId && apiKey);
}

/**
 * One-shot read of a whole collection. Resolves to the same array shape
 * the callers build from an onSnapshot result, or rejects — callers
 * treat a rejection as "nothing to show yet" and wait for the SDK.
 *
 * `pageSize` is deliberately generous: this catalogue is far smaller
 * than one page, and paginating here would defeat the point of getting
 * the first screen of products in a single round-trip.
 */
export async function fetchCollectionOnce(collectionPath, { signal } = {}) {
  if (!canFetchOverRest()) throw new Error('Firestore REST is not configured');

  const url = `${BASE}/${collectionPath}?pageSize=300&key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Firestore REST responded ${response.status}`);

  const body = await response.json();
  // An empty collection comes back as `{}` with no `documents` key.
  return (body.documents || []).map(decodeDocument);
}
