/**
 * Firestore Security Rules test suite (added by the security audit,
 * 2026-09-18).
 *
 * firestore.rules is the only security boundary in this project that a
 * client cannot bypass, and until now nothing verified it. These 21
 * cases run the REAL rules file against the Firestore emulator and
 * assert both directions — that legitimate admin writes still succeed,
 * and that the cases the audit closed (SEC-04 `instagramUrl:
 * "javascript:..."`, SEC-05 an unbounded gallery document) are refused.
 *
 * Run it after ANY edit to firestore.rules, and before deploying them.
 *
 * SETUP (once):
 *   cd admin-scripts
 *   npm install --no-save --legacy-peer-deps @firebase/rules-unit-testing firebase
 *
 * RUN (from the project root — it needs firebase.json to find the rules):
 *   npx firebase-tools@13 emulators:exec --only firestore --project demo-meshape  *     "node admin-scripts/test-firestore-rules.mjs"
 *
 * The emulator needs a JDK. firebase-tools 15+ requires Java 21; this
 * machine has Java 17, which is why the command above pins @13.
 *
 * `--project demo-meshape` matters: a project id starting with `demo-`
 * tells the emulator to run fully offline, so this can never touch the
 * real meshape-gift-shop project or its data.
 */

import { readFileSync } from 'node:fs';
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';

// Resolved from this file's own location, so it works from any cwd.
const rules = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');

const testEnv = await initializeTestEnvironment({
  projectId: 'demo-meshape',
  firestore: { rules, host: '127.0.0.1', port: 8080 },
});

const admin = testEnv.authenticatedContext('admin-uid', { admin: true }).firestore();
const nonAdmin = testEnv.authenticatedContext('user-uid', {}).firestore();
const anon = testEnv.unauthenticatedContext().firestore();

const VALID_PRODUCT = {
  name: 'Engraved Lamp',
  category: 'Lamps',
  price: 499,
  available: true,
  images: ['https://res.cloudinary.com/demo/image/upload/v1/a.jpg'],
};

let pass = 0, fail = 0;
async function check(label, expect, fn) {
  try {
    await (expect === 'allow' ? assertSucceeds(fn()) : assertFails(fn()));
    console.log(`  PASS  [${expect.padEnd(5)}] ${label}`);
    pass++;
  } catch (e) {
    console.log(`  FAIL  [${expect.padEnd(5)}] ${label}\n          ${String(e.message).split('\n')[0]}`);
    fail++;
  }
}

console.log('\n--- Authorization (pre-existing behaviour, regression check) ---');
await check('anonymous can READ a product', 'allow', () => getDoc(doc(anon, 'products/p1')));
await check('anonymous CANNOT write a product', 'deny', () => setDoc(doc(anon, 'products/p1'), VALID_PRODUCT));
await check('signed-in non-admin CANNOT write a product', 'deny', () => setDoc(doc(nonAdmin, 'products/p1'), VALID_PRODUCT));
await check('admin CAN write a valid product', 'allow', () => setDoc(doc(admin, 'products/p1'), VALID_PRODUCT));
await check('admin CANNOT write a zero price', 'deny', () => setDoc(doc(admin, 'products/p2'), { ...VALID_PRODUCT, price: 0 }));
await check('admin CANNOT write a negative price', 'deny', () => setDoc(doc(admin, 'products/p3'), { ...VALID_PRODUCT, price: -5 }));
await check('admin CANNOT write an empty images list', 'deny', () => setDoc(doc(admin, 'products/p4'), { ...VALID_PRODUCT, images: [] }));

console.log('\n--- SEC-04: instagramUrl must be an http(s) URL (NEW) ---');
await check('reject instagramUrl = javascript:alert(1)', 'deny', () => setDoc(doc(admin, 'products/x1'), { ...VALID_PRODUCT, instagramUrl: 'javascript:alert(1)' }));
await check('reject instagramUrl = data:text/html,<script>', 'deny', () => setDoc(doc(admin, 'products/x2'), { ...VALID_PRODUCT, instagramUrl: 'data:text/html,<script>alert(1)</script>' }));
await check('reject instagramUrl = vbscript:msgbox(1)', 'deny', () => setDoc(doc(admin, 'products/x3'), { ...VALID_PRODUCT, instagramUrl: 'vbscript:msgbox(1)' }));
await check('reject instagramUrl of the wrong type (number)', 'deny', () => setDoc(doc(admin, 'products/x4'), { ...VALID_PRODUCT, instagramUrl: 42 }));
await check('accept a real https Instagram URL', 'allow', () => setDoc(doc(admin, 'products/x5'), { ...VALID_PRODUCT, instagramUrl: 'https://www.instagram.com/p/abc/' }));
await check('accept an empty instagramUrl (field left blank)', 'allow', () => setDoc(doc(admin, 'products/x6'), { ...VALID_PRODUCT, instagramUrl: '' }));
await check('accept a product with no instagramUrl field at all', 'allow', () => setDoc(doc(admin, 'products/x7'), VALID_PRODUCT));

console.log('\n--- SEC-04: free-text fields are bounded (NEW) ---');
await check('reject a 6000-char description', 'deny', () => setDoc(doc(admin, 'products/x8'), { ...VALID_PRODUCT, description: 'a'.repeat(6000) }));
await check('accept a normal description', 'allow', () => setDoc(doc(admin, 'products/x9'), { ...VALID_PRODUCT, description: 'A hand-engraved wooden lamp.' }));

console.log('\n--- SEC-05: settings/shopGallery is bounded (NEW) ---');
const photo = { id: 'a', url: 'https://res.cloudinary.com/demo/image/upload/v1/a.jpg', alt: 'x', category: 'shop' };
await check('anonymous CANNOT write settings', 'deny', () => setDoc(doc(anon, 'settings/shopGallery'), { photos: [photo] }));
await check('admin CAN write a normal gallery', 'allow', () => setDoc(doc(admin, 'settings/shopGallery'), { photos: [photo, photo] }));
await check('admin CANNOT write a 201-entry gallery', 'deny', () => setDoc(doc(admin, 'settings/shopGallery'), { photos: Array(201).fill(photo) }));

console.log('\n--- Default-deny on unlisted collections (regression check) ---');
await check('admin CANNOT read an unlisted collection', 'deny', () => getDoc(doc(admin, 'secrets/s1')));
await check('admin CANNOT write an unlisted collection', 'deny', () => setDoc(doc(admin, 'secrets/s1'), { a: 1 }));

await testEnv.cleanup();
console.log(`\n==== ${pass} passed, ${fail} failed ====`);
process.exit(fail ? 1 : 0);
