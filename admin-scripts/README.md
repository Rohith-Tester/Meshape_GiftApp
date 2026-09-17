# Admin Scripts

Trusted, locally-run setup scripts using the Firebase Admin SDK. **Nothing
in this folder is part of the deployed frontend app** — it is never built
by Vite, never shipped to Vercel, and should never be imported from `src/`.

## One-time setup

1. **Create a Firebase project** at https://console.firebase.google.com if
   you haven't already.
2. **Enable Firestore** (Native mode) and **Authentication → Email/Password
   sign-in**.
3. **Download a service account key**: Project Settings → Service Accounts
   → "Generate new private key". Save the file as
   `admin-scripts/service-account-key.json`.
   This file is already in `.gitignore` — never commit it, never upload it
   anywhere public. Anyone who has it has full admin control of your
   Firebase project.
4. **Create the one admin user**: Authentication → Users → Add User. Use a
   real email and a strong password. Copy the generated User UID.
5. Install dependencies and run the scripts:
   ```bash
   cd admin-scripts
   npm install
   node setAdminClaim.js <the-user-uid>
   node seedFirestore.js
   ```
6. **Deploy the security rules** from the project root (requires the
   Firebase CLI: `npm install -g firebase-tools`, then `firebase login`):
   ```bash
   firebase deploy --only firestore:rules
   ```
7. Sign in at `/admin` on the deployed site with that email/password.

## Why this can't be done from the app itself

Granting the `admin` custom claim requires the Firebase Admin SDK, which
has unrestricted access to your entire project. It must never run in a
browser — there would be no way to stop a visitor from granting themselves
admin access. That's the whole reason this is a separate, locally-run
script rather than a button in the Admin Dashboard.
