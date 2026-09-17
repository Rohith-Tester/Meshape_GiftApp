import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * React Router doesn't reset scroll position on navigation by default —
 * the browser just keeps whatever scroll offset you were at on the
 * previous page. So scrolling down on, say, the Products page and then
 * clicking a link to Cart would open Cart already scrolled down (often
 * landing near its bottom), looking like it "jumped to the end" instead
 * of opening fresh at the top. This resets scroll to the top on every
 * route change so every new page always opens at its top, like a normal
 * multi-page site.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
