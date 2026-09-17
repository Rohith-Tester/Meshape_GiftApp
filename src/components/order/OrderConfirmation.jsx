import { useState } from 'react';
import './OrderConfirmation.css';

/**
 * The customer must review the generated message and manually press
 * SEND inside WhatsApp — this component only opens WhatsApp with the
 * message pre-filled via a wa.me link, it never claims or attempts to
 * send anything automatically. A wa.me link is plain text only (no
 * file), which is what lets it open directly to the shop's exact chat
 * in one tap. Any photo the customer wants added to a gift is sent by
 * them directly in this same WhatsApp chat — it's never collected on
 * the website.
 */
export default function OrderConfirmation({ orderId, message, whatsappLink, onStartNewOrder }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can fail (permissions, older browsers) — the
      // message is still fully visible and selectable in the textarea.
    }
  }

  return (
    <div className="order-confirmation">
      <p className="order-confirmation__id-label">Your Order ID</p>
      <p className="order-confirmation__id">{orderId}</p>

      <p className="order-confirmation__instructions">
        Review the message below, then open WhatsApp and press <strong>Send</strong> yourself — we don't send
        anything on your behalf.
      </p>

      <textarea
        className="order-confirmation__message"
        value={message}
        readOnly
        rows={12}
        aria-label="WhatsApp order message"
      />

      <div className="order-confirmation__actions">
        <button type="button" className="order-confirmation__copy" onClick={handleCopy}>
          {copied ? 'Copied ✓' : 'Copy Message'}
        </button>
        <a href={whatsappLink} target="_blank" rel="noreferrer" className="order-confirmation__send">
          Open WhatsApp to Send
        </a>
      </div>

      <button type="button" className="order-confirmation__new-order" onClick={onStartNewOrder}>
        Start a New Order
      </button>
    </div>
  );
}
