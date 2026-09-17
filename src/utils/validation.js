/**
 * Shared validation logic, kept out of components so it can be reused by
 * the customization form, the order/delivery form, and (in Phase 6+)
 * Admin forms without duplicating rules.
 */

export function isRequired(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/** Accepts Indian mobile numbers, optionally with a +91 prefix and spaces. */
export function isValidMobile(value) {
  const digits = (value || '').replace(/[\s-]/g, '').replace(/^\+?91/, '');
  return /^[6-9]\d{9}$/.test(digits);
}

export function isValidPincode(value) {
  return /^\d{6}$/.test((value || '').trim());
}

/**
 * Validates an uploaded image file against Master Specification section 30:
 * allowed types (JPG/JPEG/PNG/WEBP) and a size ceiling. Extension AND MIME
 * type are both checked since either alone can be spoofed — a production
 * backend must re-validate server-side; this is a client-side first line
 * of defense only.
 */
const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export function validateImageFile(file) {
  if (!file) return { valid: false, error: 'No file selected.' };

  const nameLower = file.name.toLowerCase();
  const hasAllowedExtension = ALLOWED_IMAGE_EXTENSIONS.some((ext) => nameLower.endsWith(ext));
  if (!hasAllowedExtension) {
    return { valid: false, error: 'Only JPG, PNG, or WEBP images are allowed.' };
  }

  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: 'Only JPG, PNG, or WEBP images are allowed.' };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return { valid: false, error: 'Image must be smaller than 5MB.' };
  }

  return { valid: true, error: null };
}

/** Validates the pickup-fulfillment customer details form. */
export function validatePickupForm(form) {
  const errors = {};
  if (!isRequired(form.name)) errors.name = 'Name is required.';
  if (!isValidMobile(form.mobile)) errors.mobile = 'Enter a valid 10-digit mobile number.';
  return errors;
}

/** Validates the home-delivery customer details + address form. */
export function validateDeliveryForm(form) {
  const errors = {};
  if (!isRequired(form.name)) errors.name = 'Name is required.';
  if (!isValidMobile(form.mobile)) errors.mobile = 'Enter a valid 10-digit mobile number.';
  if (!isRequired(form.houseNumber)) errors.houseNumber = 'House/Door number is required.';
  if (!isRequired(form.street)) errors.street = 'Street is required.';
  if (!isRequired(form.area)) errors.area = 'Area is required.';
  if (!isRequired(form.city)) errors.city = 'City is required.';
  if (!isRequired(form.district)) errors.district = 'District is required.';
  if (!isRequired(form.state)) errors.state = 'State is required.';
  if (!isValidPincode(form.pincode)) errors.pincode = 'Enter a valid 6-digit pincode.';
  return errors;
}
