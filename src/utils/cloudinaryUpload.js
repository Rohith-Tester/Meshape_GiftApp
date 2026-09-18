/**
 * Uploads a single image file to Cloudinary using an UNSIGNED upload
 * preset and returns its public `secure_url`.
 *
 * ⚠️ Documented limitation, not "fully hardened": ⚠️
 * This is an unsigned upload — Cloudinary accepts the request based only
 * on the preset name, which is a public value baked into this app's JS
 * bundle (see VITE_CLOUDINARY_UPLOAD_PRESET in .env.example). Anyone who
 * finds that preset name could POST their own images to this Cloudinary
 * account from outside this app, consuming its free-tier quota.
 *
 * This does NOT let anyone alter the live site: the image URL only ever
 * appears on the storefront after it's written into a Firestore document,
 * and that write is genuinely protected by firestore.rules (admin custom
 * claim required). So the exposure here is "wasted Cloudinary quota,"
 * never "site compromised."
 *
 * The fully-hardened alternative — a server-signed upload via a Firebase
 * Cloud Function that verifies the caller's admin claim before signing —
 * was deliberately not built for this project, because Cloud Functions
 * require linking a billing account (Blaze plan) to Firebase, which this
 * budget/no-card constraint ruled out. See PROJECT_REQUIREMENTS.md →
 * "Phase 8 architecture notes" for the full tradeoff.
 *
 * ⚠️ VERIFIED 2026-09-18 — the preset restrictions are NOT configured.
 *
 * This comment previously claimed the preset "restricts allowed formats,
 * max file size, and the destination folder". Probing the live preset
 * directly (see admin-scripts/verify-cloudinary-preset.js) showed none
 * of that is true:
 *
 *   - a .gif and a .bmp were both ACCEPTED (should be jpg/png/webp only)
 *   - uploads land in the account ROOT, not a fixed folder
 *   - the size ceiling is Cloudinary's 10 MB default, not the ~5 MB
 *     documented here
 *
 * So the client-side checks in src/utils/validation.js are currently the
 * ONLY thing enforcing any of it — and anyone can skip them with a
 * single curl call, because the preset name ships in this bundle.
 *
 * The exposure is unchanged in KIND (wasted Cloudinary quota and junk
 * assets, never site compromise — the storefront only renders URLs that
 * an admin wrote into Firestore, which firestore.rules protects). But it
 * is larger than it was documented to be.
 *
 * TO FIX — three settings in the Cloudinary dashboard, no code change:
 *   Settings → Upload → Upload presets → meshape_unsigned → Edit
 *     1. Allowed formats:  jpg, png, webp
 *     2. Max file size:    5000000  (5 MB)
 *     3. Folder:           meshape/products
 *   Then re-run:  node admin-scripts/verify-cloudinary-preset.js
 */
export async function uploadToCloudinary(file) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Cloudinary is not configured — set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.'
    );
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error?.message || 'Image upload failed. Please try again.');
  }

  const data = await response.json();
  return data.secure_url;
}
