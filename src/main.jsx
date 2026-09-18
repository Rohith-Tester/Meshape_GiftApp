import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/fonts.css';
import './styles/global.css';
import './styles/animations.css';

/**
 * Mount after the browser's first paint, not before it (NEW-23).
 *
 * index.html ships a static copy of the navigation bar and hero (see the
 * comment above #root there) so the page has something real to show
 * before any JavaScript runs. That only helps if the browser actually
 * gets a chance to draw it — and it was not getting one.
 *
 * The entry script is a module, so it runs the moment it has been
 * parsed, which is before the browser's first paint. Calling render()
 * there hands React the main thread for its entire initial render, and
 * the browser cannot paint until that finishes. Lighthouse showed the
 * DOM complete at 78ms and the first pixel at 1197ms: over a second
 * during which fully laid-out content sat in the document, invisible,
 * waiting behind React's bootstrap.
 *
 * requestAnimationFrame runs its callback just before the frame the
 * browser is about to draw; queueing a task from inside it puts the
 * mount after that frame has been committed. React then mounts into a
 * page the person is already looking at, and replaces the shell with
 * the identical real markup.
 *
 * This is half the fix and the smaller half. Yielding only helps if the
 * work being yielded to is short, so the home page also keeps its
 * below-the-fold sections out of React's first render — see
 * hooks/useDeferredRender.js, which is what actually reduces the amount
 * of work standing between the person and the first frame.
 */
function mountApp() {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

let mounted = false;
function mountOnce() {
  if (mounted) return;
  mounted = true;
  mountApp();
}

requestAnimationFrame(() => setTimeout(mountOnce, 0));
// requestAnimationFrame never fires in a background tab, so without
// this the app would never mount for someone who opened the site in a
// tab they have not switched to yet. Whichever fires first wins.
setTimeout(mountOnce, 120);
