import { useEffect, useState } from 'react';
import './Loader.css';

/**
 * Brief, premium loading screen shown once on first app mount. It is a
 * single orchestrated moment (mark draws in, then the whole screen fades
 * away) rather than a spinner, matching the "cinematic" brief.
 *
 * minDurationMs keeps it from flashing on very fast connections while
 * never blocking real load time — it runs in parallel with app boot, not
 * before it.
 *
 * BUG FIX (Phase 10 QA): this previously unmounted the component at
 * exactly `minDurationMs`, which is also the moment Loader.css's
 * `animation-delay: 900ms` starts the fade-out — so React was removing
 * the DOM node right as the fade was supposed to *begin*, and the
 * intended smooth 520ms fade never actually played; the screen just cut
 * out abruptly. `fadeOutDurationMs` below must match Loader.css's
 * `--duration-slow` (520ms) exactly, and the unmount timer now waits for
 * the full delay + fade duration before removing the element, so the
 * animation has time to finish playing first.
 */
const FADE_OUT_DURATION_MS = 520; // must match var(--duration-slow) in tokens.css

/**
 * Fix (NEW-05): this used to run on a fixed 900 + 520 ms timer, covering
 * the whole viewport at modal z-index — 1,363 ms of dead,
 * un-interactable time on EVERY page load.
 *
 * Revised (NEW-23): the first version of this fix held the splash until
 * the catalogue had loaded. That turned out to be actively harmful. The
 * hero is STATIC content — it needs nothing from Firestore — and it is
 * also the Largest Contentful Paint element, so covering it until a
 * database round-trip finished delayed LCP by seconds on a slow
 * connection. The catalogue sections below have their own skeletons
 * (NEW-18), so late data is already handled gracefully without hiding
 * the whole page behind an overlay.
 *
 * So: a brief brand moment on a fixed, short timer, which stops
 * swallowing clicks the instant it begins fading, and never waits on
 * the network.
 */
export default function Loader({ minDurationMs = 450 }) {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const fade = setTimeout(() => setLeaving(true), minDurationMs);
    const remove = setTimeout(() => setVisible(false), minDurationMs + FADE_OUT_DURATION_MS);
    return () => {
      clearTimeout(fade);
      clearTimeout(remove);
    };
  }, [minDurationMs]);

  if (!visible) return null;

  return (
    <div className={`loader ${leaving ? 'loader--leaving' : ''}`} role="status" aria-live="polite">
      <svg
        className="loader__mark"
        width="72"
        height="72"
        viewBox="0 0 72 72"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="36" cy="36" r="30" className="loader__track" />
        <circle cx="36" cy="36" r="30" className="loader__stroke" />
      </svg>
      <p className="loader__label">MeShape Gift Shop</p>
      <span className="visually-hidden">Loading MeShape Gift Shop</span>
    </div>
  );
}
