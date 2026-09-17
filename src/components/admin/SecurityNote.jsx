import './SecurityNote.css';

/**
 * Replaces the Phase 6/7 "DEMO MODE" banner. Admin authentication and
 * authorization are now real (Firebase Auth + an `admin` custom claim,
 * enforced server-side by firestore.rules) — there is no fake-security
 * disclaimer needed for that anymore. The one disclosed, genuine
 * limitation left is the unsigned Cloudinary upload preset; see
 * src/utils/cloudinaryUpload.js and PROJECT_REQUIREMENTS.md for the full
 * explanation of why that's a quota-abuse risk, not a site-security one.
 */
export default function SecurityNote() {
  return (
    <div className="security-note">
      Product/offer data here is protected by Firebase Authentication and Firestore Security Rules — only this
      account can write. Image uploads use an unsigned Cloudinary preset; see{' '}
      <code>PROJECT_REQUIREMENTS.md</code> for its disclosed quota-abuse limitation.
    </div>
  );
}
