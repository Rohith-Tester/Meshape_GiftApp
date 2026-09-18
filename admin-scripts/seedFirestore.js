/**
 * Populates a fresh Firestore database with the same demo catalogue
 * this project has used since Phase 2 — src/data/products.js,
 * src/data/offers.js, and src/data/shopGallery.js. Run this ONCE against
 * a new Firebase project so the live site doesn't launch empty.
 *
 * ⚠️ THIS SCRIPT IS NEVER PART OF THE DEPLOYED APP. ⚠️ Same caveats as
 * setAdminClaim.js — Admin SDK, local-only, needs service-account-key.json.
 *
 * Run:
 *   cd admin-scripts
 *   npm install
 *   node seedFirestore.js
 *
 * Safe to re-run: it overwrites documents by the same product ids each
 * time rather than duplicating them, though running it after the admin
 * has made real edits would overwrite those edits — intended for
 * first-time setup only.
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
// Security audit 2026-09-18 (SEC-06): migrated to firebase-admin v14's
// modular entry points — v14 is the release that drops the vulnerable
// `uuid` transitive dependency, and it removes the old `admin.*`
// namespaced API this script previously used.
import { initializeApp, cert } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { products } from '../src/data/products.js';
import { offers } from '../src/data/offers.js';
import { shopGallery } from '../src/data/shopGallery.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const serviceAccount = JSON.parse(readFileSync(join(__dirname, 'service-account-key.json'), 'utf8'));

const app = initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore(app);

async function seed() {
  const batch = db.batch();

  for (const product of products) {
    const { id, ...data } = product;
    batch.set(db.collection('products').doc(id), {
      ...data,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  for (const offer of offers) {
    const { id, ...data } = offer;
    batch.set(db.collection('offers').doc(id), data);
  }

  batch.set(db.doc('settings/shopGallery'), { photos: shopGallery });

  await batch.commit();
  console.log(`✅ Seeded ${products.length} products, ${offers.length} offers, and ${shopGallery.length} gallery photos.`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
