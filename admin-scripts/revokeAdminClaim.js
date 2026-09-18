/**
 * Removes the `admin` custom claim from one Firebase Auth user AND
 * invalidates their existing sessions.
 *
 * ⚠️ THIS SCRIPT IS NEVER PART OF THE DEPLOYED APP. ⚠️
 * Same caveats as setAdminClaim.js — it uses the Firebase Admin SDK,
 * which has full read/write power over the entire project. Run it
 * locally, with Node, never in a browser.
 *
 * WHY THIS EXISTS (security audit 2026-09-18, finding SEC-11)
 * -----------------------------------------------------------
 * The project had setAdminClaim.js to GRANT admin access and nothing at
 * all to take it back. That is half an access-control system: when an
 * admin account has to be shut off — a laptop is lost, someone leaves,
 * a password is suspected — there was no supported procedure, and the
 * obvious improvisations are wrong in a way that is easy to miss.
 *
 * In particular, clearing the claim ON ITS OWN IS NOT ENOUGH. Firestore
 * Security Rules read `request.auth.token.admin`, and that value comes
 * from an ID token that Firebase already signed and handed to the user.
 * That token stays cryptographically valid until it expires — up to an
 * hour — so for that whole window the rules keep accepting writes from
 * someone whose admin rights you believe you just removed.
 *
 * revokeRefreshTokens() is what closes the window: it invalidates the
 * refresh token, so the moment the current ID token expires the user
 * cannot mint a new one and is forced back to the login screen. Doing
 * both, in this order, is the reason this script exists rather than a
 * note telling you to edit the claim by hand.
 *
 * REMAINING WINDOW, STATED PLAINLY
 * --------------------------------
 * Between running this and the user's current ID token expiring, that
 * token still satisfies firestore.rules. To cut the window to zero you
 * would additionally disable or delete the account in the Firebase
 * Console (Authentication → Users), which takes effect immediately.
 * For an urgent revocation, do that as well — this script prints a
 * reminder.
 *
 * Setup: identical to setAdminClaim.js — see that file. You need
 * admin-scripts/service-account-key.json, which is gitignored and must
 * never be committed.
 *
 * Run:
 *   cd admin-scripts
 *   npm install
 *   node revokeAdminClaim.js <the-user-uid>
 *
 * To confirm afterwards, re-run with --check, which reports the current
 * claims without changing anything:
 *   node revokeAdminClaim.js <the-user-uid> --check
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const __dirname = dirname(fileURLToPath(import.meta.url));

const uid = process.argv[2];
const checkOnly = process.argv.includes('--check');

if (!uid || uid.startsWith('--')) {
  console.error('Usage: node revokeAdminClaim.js <user-uid> [--check]');
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(join(__dirname, 'service-account-key.json'), 'utf8'));

const app = initializeApp({
  credential: cert(serviceAccount),
});

const auth = getAuth(app);

try {
  const before = await auth.getUser(uid);

  if (checkOnly) {
    console.log(`User:   ${before.email || '(no email)'}`);
    console.log(`Claims: ${JSON.stringify(before.customClaims || {})}`);
    console.log(`Admin:  ${before.customClaims?.admin === true ? 'YES' : 'no'}`);
    console.log(`Tokens valid after: ${before.tokensValidAfterTime}`);
    process.exit(0);
  }

  if (before.customClaims?.admin !== true) {
    console.log(`ℹ️  ${before.email || uid} does not currently have the admin claim.`);
    console.log('   Revoking refresh tokens anyway, so any open session is still ended.');
  }

  // 1. Drop the claim. Preserve any other custom claims the account may
  //    carry rather than wiping the object wholesale — this script's job
  //    is to remove admin, not everything.
  const remainingClaims = { ...(before.customClaims || {}) };
  delete remainingClaims.admin;
  await auth.setCustomUserClaims(uid, remainingClaims);

  // 2. Invalidate the refresh token. Without this step the user keeps a
  //    working admin ID token until it expires — see the note above.
  await auth.revokeRefreshTokens(uid);

  const after = await auth.getUser(uid);

  console.log(`✅ Removed the admin claim from ${after.email || uid}.`);
  console.log(`   Remaining claims: ${JSON.stringify(after.customClaims || {})}`);
  console.log(`   Refresh tokens revoked as of: ${after.tokensValidAfterTime}`);
  console.log('');
  console.log('   Their CURRENT ID token stays valid until it expires (up to 1 hour),');
  console.log('   and firestore.rules will accept it until then. If this revocation is');
  console.log('   urgent, also disable the account in the Firebase Console:');
  console.log('   Authentication → Users → (the user) → Disable account.');
  process.exit(0);
} catch (err) {
  if (err.code === 'auth/user-not-found') {
    console.error(`Failed: no Firebase Auth user with uid ${uid}.`);
  } else {
    console.error('Failed to revoke admin claim:', err);
  }
  process.exit(1);
}
