import { useEffect, useState } from 'react';

/**
 * Returns false on the first render and true immediately afterwards, so
 * a component can leave expensive, off-screen subtrees out of React's
 * very first pass (NEW-23).
 *
 * The problem this solves: React's initial render is one synchronous
 * block of main-thread work, and the browser cannot paint anything
 * while it runs — not even the static shell in index.html that exists
 * precisely so there is something to look at. Lighthouse showed the DOM
 * complete at 78ms and the first pixel over a second later, with the
 * gap being almost entirely that one render. On the home page that
 * render builds eight sections, of which exactly one (the hero) is on
 * screen on a phone.
 *
 * Deferring the rest is not a trick to move a number: it is less work
 * before the first frame, so the paint genuinely happens sooner. The
 * deferred content arrives on the next tick, long before anyone could
 * scroll to it, and `content-visibility: auto` (see styles/global.css)
 * keeps its layout cost low even then.
 *
 * Callers must render a placeholder of roughly the right height while
 * this is false, or the page will shift when the real content lands.
 */
export function useDeferredRender() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // requestAnimationFrame first so this is queued behind the frame
    // the browser is about to produce, then a task so it lands after
    // that frame has been committed rather than in front of it.
    let timer = 0;
    const frame = requestAnimationFrame(() => {
      timer = setTimeout(() => setReady(true), 0);
    });

    return () => {
      cancelAnimationFrame(frame);
      if (timer) clearTimeout(timer);
    };
  }, []);

  return ready;
}
