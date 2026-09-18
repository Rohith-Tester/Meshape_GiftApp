import { useEffect, useRef } from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Shared dialog behaviour for every modal in the app.
 *
 * Fixes two defects that both modals had:
 *
 *  - BUG-11: nothing locked the page behind the dialog, so scrolling
 *    while the image viewer or the personalization modal was open moved
 *    the page underneath (measured: scrollY 136 → 636 with the viewer
 *    still open). On a phone this makes the viewer feel broken and
 *    loses the customer's place in the catalogue.
 *
 *  - BUG-12: both dialogs declared role="dialog" aria-modal="true" and
 *    handled Escape, but Tab walked straight out of them into the page
 *    behind — so a keyboard or screen-reader user could end up
 *    operating content they could not see.
 *
 * Returns a ref to put on the dialog element. Focus moves into the
 * dialog on open, cycles within it on Tab/Shift+Tab, and returns to
 * whatever was focused before it opened.
 */
export function useModalBehavior({ onClose } = {}) {
  const dialogRef = useRef(null);

  /**
   * Callers pass an inline arrow (`onClose={() => setX(null)}`), so its
   * identity changes on every render of the parent. Holding it in a ref
   * keeps the effect below mounted once instead of tearing down and
   * re-running each render — which would otherwise re-apply the scroll
   * lock repeatedly and, worse, yank focus back to the first element
   * every time the parent re-rendered (e.g. on each arrow-key step
   * through the image viewer).
   */
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previouslyFocused = document.activeElement;

    // --- Scroll lock (BUG-11) -------------------------------------
    // Compensate for the scrollbar's width so the page doesn't shift
    // sideways the moment the dialog opens.
    const { body, documentElement } = document;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    // --- Initial focus --------------------------------------------
    const focusables = dialog ? Array.from(dialog.querySelectorAll(FOCUSABLE)) : [];
    (focusables[0] || dialog)?.focus?.();

    // --- Focus trap + Escape (BUG-12) -----------------------------
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onCloseRef.current?.();
        return;
      }
      if (e.key !== 'Tab' || !dialog) return;

      // Re-query every time: dialog contents can change while open.
      const items = Array.from(dialog.querySelectorAll(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
      if (items.length === 0) {
        e.preventDefault();
        dialog.focus?.();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];

      if (e.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
      previouslyFocused?.focus?.();
    };
    // Intentionally empty: mount/unmount only. See onCloseRef above.
  }, []);

  return dialogRef;
}
