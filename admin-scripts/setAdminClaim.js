/**
 * Grants the `admin: true` custom claim to one Firebase Auth user.
 *
 * ⚠️ THIS SCRIPT IS NEVER PART OF THE DEPLOYED APP. ⚠️
 * It uses the Firebase Admin SDK, which has full read/write power over
 * your entire project and must never run in a browser or be bundled
 * into the frontend. Run it locally, once, with Node.
 *
 * Setup:
 *   1. In the Firebase Console: Project Settings → Service Accounts →
 *      "Generate new private key". Save the downloaded JSON file as
 *      admin-scripts/service-account-key.json.
 *      NEVER commit this file — it is already covered by .gitignore.
 *   2. In the Firebase Console: Authentication → Users → Add User.
 *      Create the one admin account with a strong password. Copy its
 *      User UID.
 *   3. Run:
 *        cd admin-scripts
 *        npm install
 *        node setAdminClaim.js <the-user-uid>
 *   4. Sign out and back in on the admin login page (or wait up to ~1
 *      hour for Firebase's automatic token refresh) for the claim to
 *      take effect — see src/context/AdminAuthContext.jsx for why.
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import admin from 'firebase-admin';

const __dirname = dirname(fileURLToPath(import.meta.url));

const uid = process.argv[2];
if (!uid) {
  console.error('Usage: node setAdminClaim.js <user-uid>');
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(join(__dirname, 'service-account-key.json'), 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

try {
  await admin.auth().setCustomUserClaims(uid, { admin: true });
  console.log(`✅ Granted admin claim to user ${uid}.`);
  console.log('Sign out and back in on /admin for it to take effect immediately.');
  process.exit(0);
} catch (err) {
  console.error('Failed to set custom claim:', err);
  process.exit(1);
}
