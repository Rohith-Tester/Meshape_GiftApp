/**
 * Tests for the admin idle-session policy (security audit 2026-09-18,
 * finding SEC-10). Run with:
 *
 *   npm test
 *
 * No dependencies and no emulator: createIdleWatcher takes its timer
 * functions and its event target as parameters precisely so this can run
 * in milliseconds instead of requiring a real admin login and a
 * thirty-minute wait.
 */
import { createIdleWatcher, ACTIVITY_EVENTS } from '../src/utils/idleWatcher.js';

let pass = 0;
let fail = 0;

function check(label, condition) {
  if (condition) {
    console.log(`  PASS  ${label}`);
    pass += 1;
  } else {
    console.log(`  FAIL  ${label}`);
    fail += 1;
  }
}

/** A controllable clock, so "30 minutes" costs no real time. */
function fakeClock() {
  let now = 0;
  let nextId = 1;
  const pending = new Map();
  return {
    setTimeoutFn(fn, ms) {
      const id = nextId++;
      pending.set(id, { fn, at: now + ms });
      return id;
    },
    clearTimeoutFn(id) {
      pending.delete(id);
    },
    advance(ms) {
      const target = now + ms;
      // Fire in chronological order, like a real event loop.
      for (;;) {
        let due = null;
        for (const [id, t] of pending) {
          if (t.at <= target && (due === null || t.at < pending.get(due).at)) due = id;
        }
        if (due === null) break;
        const { fn, at } = pending.get(due);
        pending.delete(due);
        now = at;
        fn();
      }
      now = target;
    },
    pendingCount() {
      return pending.size;
    },
  };
}

/** A stand-in for `window` that records what is listening. */
function fakeTarget() {
  const listeners = new Map();
  return {
    addEventListener(type, fn) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(fn);
    },
    removeEventListener(type, fn) {
      listeners.get(type)?.delete(fn);
    },
    emit(type) {
      listeners.get(type)?.forEach((fn) => fn());
    },
    count() {
      let n = 0;
      listeners.forEach((set) => (n += set.size));
      return n;
    },
  };
}

function build(timeoutMs = 1000) {
  const clock = fakeClock();
  const target = fakeTarget();
  let idleCalls = 0;
  const watcher = createIdleWatcher({
    timeoutMs,
    onIdle: () => {
      idleCalls += 1;
    },
    target,
    setTimeoutFn: clock.setTimeoutFn,
    clearTimeoutFn: clock.clearTimeoutFn,
  });
  return { clock, target, watcher, idle: () => idleCalls };
}

console.log('\n--- SEC-10: the session actually expires ---');
{
  const { clock, watcher, idle } = build(1000);
  watcher.start();
  clock.advance(999);
  check('has NOT signed out one tick before the timeout', idle() === 0);
  clock.advance(1);
  check('HAS signed out exactly at the timeout', idle() === 1);
}

console.log('\n--- SEC-10: real work is never interrupted ---');
{
  const { clock, target, watcher, idle } = build(1000);
  watcher.start();
  // Someone typing steadily for well past the timeout.
  for (let i = 0; i < 10; i += 1) {
    clock.advance(900);
    target.emit('keydown');
  }
  check('still signed in after 9000ms of continuous activity', idle() === 0);
  clock.advance(1000);
  check('signs out 1000ms after the activity stops', idle() === 1);
}

console.log('\n--- SEC-10: every activity event resets the clock ---');
for (const evt of ACTIVITY_EVENTS) {
  const { clock, target, watcher, idle } = build(1000);
  watcher.start();
  clock.advance(900);
  target.emit(evt);
  clock.advance(900);
  check(`"${evt}" resets the idle countdown`, idle() === 0);
}

console.log('\n--- SEC-10: stop() really stops ---');
{
  const { clock, target, watcher, idle } = build(1000);
  watcher.start();
  check('listeners attached while running', target.count() === ACTIVITY_EVENTS.length);
  watcher.stop();
  check('listeners detached after stop()', target.count() === 0);
  check('no timer left pending after stop()', clock.pendingCount() === 0);
  clock.advance(5000);
  check('does not sign out after stop()', idle() === 0);
}

console.log('\n--- SEC-10: onIdle fires at most once ---');
{
  const { clock, watcher, idle } = build(1000);
  watcher.start();
  clock.advance(10000);
  check('one expiry produces exactly one sign-out', idle() === 1);
  check('watcher reports itself stopped afterwards', watcher.isRunning() === false);
}

console.log('\n--- SEC-10: a late event cannot resurrect a stopped session ---');
{
  const { clock, target, watcher, idle } = build(1000);
  watcher.start();
  watcher.stop();
  // A listener that has not been detached yet, or a queued scroll.
  target.emit('scroll');
  watcher.notifyActivity();
  check('no timer scheduled by a post-stop event', clock.pendingCount() === 0);
  clock.advance(5000);
  check('still no sign-out scheduled', idle() === 0);
}

console.log('\n--- SEC-10: misconfiguration is rejected loudly ---');
for (const [label, opts] of [
  ['timeoutMs of 0', { timeoutMs: 0, onIdle: () => {} }],
  ['negative timeoutMs', { timeoutMs: -1, onIdle: () => {} }],
  ['non-numeric timeoutMs', { timeoutMs: 'soon', onIdle: () => {} }],
  ['missing onIdle', { timeoutMs: 1000 }],
]) {
  let threw = false;
  try {
    createIdleWatcher({ ...opts, target: fakeTarget() });
  } catch {
    threw = true;
  }
  check(`${label} throws rather than silently disabling the timeout`, threw);
}

console.log('\n--- start() is idempotent ---');
{
  const { clock, target, watcher, idle } = build(1000);
  watcher.start();
  watcher.start();
  check('listeners are not doubled up', target.count() === ACTIVITY_EVENTS.length);
  check('only one timer pending', clock.pendingCount() === 1);
  clock.advance(1000);
  check('signs out once, not twice', idle() === 1);
}

console.log(`\n==== ${pass} passed, ${fail} failed ====`);
process.exit(fail ? 1 : 0);
