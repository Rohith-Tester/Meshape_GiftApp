import { useState } from 'react';
import { useModalBehavior } from '../../hooks/useModalBehavior';
import './CustomizationModal.css';

/**
 * Collects customization details for a customizable product — just a
 * name/initials and a message/description, both optional. Photo
 * uploads used to be collected here too, but that was removed: any
 * photo the customer wants used (e.g. for a photo frame) is sent by
 * them directly in WhatsApp after placing the order, not through the
 * website. See the order confirmation screen / WhatsApp message for
 * where that's asked for instead.
 */
export default function CustomizationModal({ productName, onClose, onConfirm }) {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  // Escape, background scroll lock (BUG-11) and the focus trap (BUG-12)
  // all come from the shared dialog hook.
  const dialogRef = useModalBehavior({ onClose });

  function handleSubmit(e) {
    e.preventDefault();
    const hasAnyDetail = name.trim() || message.trim();
    const customization = hasAnyDetail
      ? {
          name: name.trim() || null,
          message: message.trim() || null,
        }
      : null;
    onConfirm(customization);
  }

  return (
    <div className="customization-modal__overlay" onMouseDown={onClose}>
      <div
        className="customization-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="customization-modal-title"
        tabIndex={-1}
        ref={dialogRef}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button type="button" className="customization-modal__close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <h2 id="customization-modal-title">Personalize “{productName}”</h2>
        <p className="customization-modal__hint">
          Add a name or a short description — or skip this and add it plain. If you need to send a photo for this
          gift, you can share it directly in WhatsApp after placing your order.
        </p>

        <form onSubmit={handleSubmit} className="customization-modal__form">
          <label className="customization-modal__field">
            <span>Name / Initials (optional)</span>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="e.g. Priya & Arun" />
          </label>

          <label className="customization-modal__field">
            <span>Message / Description (optional)</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={200}
              rows={3}
              placeholder="e.g. Happy Anniversary!"
            />
          </label>

          <div className="customization-modal__actions">
            <button type="button" className="customization-modal__cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="customization-modal__confirm">
              Add to Cart
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
