import { useEffect, useRef } from 'react';
import './ConfirmDialog.css';

/**
 * Phase 10 QA fix: ProductsManager and OffersManager each had their own
 * copy of this delete-confirmation overlay, and neither supported
 * closing with Escape (unlike the customer-facing CustomizationModal,
 * which does) or carried proper dialog ARIA semantics. Extracting one
 * shared component fixes both the accessibility gap and the duplicated
 * code in one pass.
 */
export default function ConfirmDialog({ title, message, confirmLabel = 'Delete', onConfirm, onCancel }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onCancel();
    }
    document.addEventListener('keydown', handleKeyDown);
    dialogRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div className="confirm-dialog__overlay" onMouseDown={onCancel}>
      <div
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-message"
        tabIndex={-1}
        ref={dialogRef}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {title && <p className="confirm-dialog__title">{title}</p>}
        <p id="confirm-dialog-message">{message}</p>
        <div className="confirm-dialog__actions">
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="confirm-dialog__confirm-btn" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
