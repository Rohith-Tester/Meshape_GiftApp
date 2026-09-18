/**
 * Idle-session policy, kept out of the React component so it can be
 * tested on its own (security audit 2026-09-18, finding SEC-10).
 *
 * WHY THIS IS A SEPARATE FILE
 * ---------------------------
 * The rule this encodes — "sign the admin out after N ms with no
 * interaction, and reset the clock on any interaction" — is the entire
 * security value of SEC-10. Buried inside a useEffect alongside Firebase
 * wiring it could only be exercised by signing in as a real admin and
 * waiting half an hour, which in practice means it would never be
 * exercised at all. Here it is a plain object with injectable timers and
 * an injectable event target, so the behaviour can be asserted directly
 * in milliseconds.
 *
 * It deliberately knows nothing about Firebase or React. It starts a
 * clock, resets it when something happens, and calls `onIdle` when the
 * clock runs out.
 */

/** Interactions that count as "the person is still here". */
export const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'scroll', 'focus'];

/**
 * @param {object}   options
 * @param {number}   options.timeoutMs     idle period before onIdle fires
 * @param {Function} options.onIdle        called once per expiry
 * @param {string[]} [options.events]      activity events to listen for
 * @param {object}   [options.target]      event target (defaults to window)
 * @param {Function} [options.setTimeoutFn]   injectable for tests
 * @param {Function} [options.clearTimeoutFn] injectable for tests
 * @returns {{ start: Function, stop: Function, notifyActivity: Function, isRunning: Function }}
 */
export function createIdleWatcher({
  timeoutMs,
  onIdle,
  events = ACTIVITY_EVENTS,
  target = typeof window !== 'undefined' ? window : null,
  setTimeoutFn = setTimeout,
  clearTimeoutFn = clearTimeout,
}) {
  if (!(timeoutMs > 0)) throw new Error('createIdleWatcher: timeoutMs must be a positive number');
  if (typeof onIdle !== 'function') throw new Error('createIdleWatcher: onIdle must be a function');

  let timer = null;
  let running = false;

  const clear = () => {
    if (timer !== null) {
      clearTimeoutFn(timer);
      timer = null;
    }
  };

  /**
   * Restarting the clock is the whole mechanism, so it is one function
   * used by both start() and every activity event. Once stopped, an
   * event that arrives late (a listener that has not been detached yet,
   * a queued scroll) must NOT silently restart the watcher — hence the
   * `running` guard.
   */
  const reset = () => {
    if (!running) return;
    clear();
    timer = setTimeoutFn(() => {
      timer = null;
      // Stop before notifying: onIdle typically signs the user out,
      // which tears this watcher down anyway, and this guarantees
      // onIdle fires at most once per start().
      running = false;
      onIdle();
    }, timeoutMs);
  };

  const handleActivity = () => reset();

  return {
    start() {
      if (running) return;
      running = true;
      if (target) {
        events.forEach((evt) => target.addEventListener(evt, handleActivity, { passive: true }));
      }
      reset();
    },

    stop() {
      running = false;
      clear();
      if (target) {
        events.forEach((evt) => target.removeEventListener(evt, handleActivity));
      }
    },

    /** Manual poke — used when a hidden tab becomes visible again. */
    notifyActivity() {
      reset();
    },

    isRunning() {
      return running;
    },
  };
}
