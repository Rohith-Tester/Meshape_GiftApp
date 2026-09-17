import { business } from '../config/business';
import { FULFILLMENT_METHODS } from '../config/delivery';
import { formatINR } from './currency';

function formatDeliveryAddress(form) {
  return [form.houseNumber, form.street, form.area, form.city, form.district, form.state, form.pincode]
    .filter(Boolean)
    .join(', ');
}

/**
 * Formats one cart line as a single readable text line, e.g.:
 *   "Customizable Bottle x1 — Name: Amjad Hajasha, Message: Happy Anniversary!"
 * Only shows whichever customization details the customer actually
 * typed in (name and/or message) — photos aren't collected on the
 * website at all; a customer who needs a photo added to their gift
 * sends it themselves directly in this same WhatsApp chat.
 */
function formatItemLine(line) {
  const customization = line.customization;
  const bits = [];
  if (line.size) bits.push(`Size: ${line.size}`);
  if (customization?.name) bits.push(`Name: ${customization.name}`);
  if (customization?.message) bits.push(`Message: ${customization.message}`);

  const customizationText = bits.length > 0 ? ` — ${bits.join(', ')}` : '';
  return `${line.name} x${line.quantity}${customizationText}`;
}

/**
 * Builds a short, plain-text WhatsApp order message — just Order ID,
 * customer name, mobile, address, the items ordered (with any
 * customization name/message text), and the total. Deliberately
 * excludes a per-item price/offer breakdown to keep the message quick
 * to read on the shop owner's end.
 */
export function buildWhatsAppMessage({ orderId, fulfillment, form, items, subtotal }) {
  const isDelivery = fulfillment === FULFILLMENT_METHODS.delivery;
  const lines = [];

  lines.push(`${business.name} — New Order`);
  lines.push('');
  lines.push(`Order ID: ${orderId}`);
  lines.push(`Name: ${form.name}`);
  lines.push(`Mobile: ${form.mobile}`);
  lines.push(isDelivery ? `Address: ${formatDeliveryAddress(form)}` : `Pickup from: ${business.address.full}`);
  lines.push('');
  lines.push('Items:');
  items.forEach((line, index) => {
    lines.push(`${index + 1}. ${formatItemLine(line)}`);
  });
  lines.push('');
  lines.push(`Total: ${formatINR(subtotal)}`);
  lines.push('');
  lines.push('(If this gift needs a photo added, please send it in this chat after this message.)');

  return lines.join('\n');
}

/** Builds the wa.me link that opens WhatsApp directly to the shop's
 * chat with the message pre-filled — the customer still presses Send
 * themselves inside WhatsApp. */
export function buildWhatsAppLink(message) {
  return `https://wa.me/${business.contact.orderWhatsappDigits}?text=${encodeURIComponent(message)}`;
}
