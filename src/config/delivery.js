/**
 * Fulfillment configuration. The delivery fee is intentionally NOT a
 * number — Master Specification section 19 requires the owner to call the
 * customer and quote the delivery charge after the order is placed.
 * When a real configurable delivery fee is introduced later, only this
 * file (and the Admin screen that edits it) should need to change.
 */
export const FULFILLMENT_METHODS = {
  pickup: 'pickup',
  delivery: 'delivery',
};

export const DELIVERY_CHARGE_TEXT = 'To be confirmed by shop';

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh',
  'Lakshadweep', 'Puducherry',
];
