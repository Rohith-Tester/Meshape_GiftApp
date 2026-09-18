import { useEffect } from 'react';

const SITE_NAME = 'MeShape Gift Shop';

function setMetaTag(attrName, attrValue, content) {
  let tag = document.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attrName, attrValue);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function setLinkTag(rel, href) {
  let tag = document.querySelector(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute('href', href);
}

/**
 * Per-page SEO, without a dependency like react-helmet. This app is a
 * client-rendered SPA (no server-side rendering), so a search engine
 * that doesn't execute JavaScript will still only see index.html's
 * default tags — but Google and most modern crawlers do execute JS, and
 * this at minimum keeps the browser tab title, social-share previews,
 * and canonical URL correct as the person navigates, which matters for
 * bookmarks, shares, and re-crawls.
 *
 * `noindex` is used for the two admin routes — there's no reason for
 * /admin or /admin/dashboard to appear in search results.
 */
const DEFAULT_DESCRIPTION =
  'MeShape Gift Shop — personalized mugs, lamps, keychains, cushions and gift hampers. Order online for pickup or delivery across India.';

export function useDocumentHead({ title, description, noindex = false }) {
  useEffect(() => {
    const fullTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME;
    document.title = fullTitle;

    /**
     * Fix (BUG-08): this used to be `if (description)`, which skipped an
     * EMPTY description and left whatever the previous render had set.
     * On a product page the first render happens while Firestore is
     * still loading, so the head was set to the not-found fallback; once
     * the real product arrived its description was '' (falsy), the
     * update was skipped, and every product page shipped the meta and
     * og:description "This product could not be found." Callers can now
     * pass '' to mean "no specific description", and we fall back to the
     * site default rather than keeping a stale — and wrong — one.
     */
    if (description !== undefined) {
      const resolved = description?.trim() ? description.trim() : DEFAULT_DESCRIPTION;
      setMetaTag('name', 'description', resolved);
      setMetaTag('property', 'og:description', resolved);
    }

    setMetaTag('property', 'og:title', fullTitle);

    const canonical = window.location.href.split('?')[0];
    setLinkTag('canonical', canonical);

    /**
     * Fix (BUG-09): index.html declares og:image and canonical as
     * root-relative paths ("/og-image.svg", "/"). Open Graph requires
     * ABSOLUTE urls, so social crawlers resolved neither and link
     * previews showed no image at all. The real origin is only knowable
     * at runtime for a client-rendered SPA, so we rewrite them here.
     */
    setMetaTag('property', 'og:url', canonical);
    const ogImage = document.querySelector('meta[property="og:image"]');
    const rawImage = ogImage?.getAttribute('content') || '';
    if (rawImage.startsWith('/')) {
      setMetaTag('property', 'og:image', `${window.location.origin}${rawImage}`);
    }

    setMetaTag('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
  }, [title, description, noindex]);
}
