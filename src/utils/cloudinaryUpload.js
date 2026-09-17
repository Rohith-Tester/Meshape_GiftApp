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
 * Mitigations actually in place: the preset (configured in the Cloudinary
 * dashboard, not in this code) restricts allowed formats, max file size,
 * and the destination folder. Client-side validation in
 * src/utils/validation.js also runs before this function is ever called.
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
