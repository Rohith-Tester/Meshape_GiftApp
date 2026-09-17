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
export function useDocumentHead({ title, description, noindex = false }) {
  useEffect(() => {
    const fullTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME;
    document.title = fullTitle;

    if (description) {
      setMetaTag('name', 'description', description);
      setMetaTag('property', 'og:description', description);
    }

    setMetaTag('property', 'og:title', fullTitle);
    setLinkTag('canonical', window.location.href.split('?')[0]);
    setMetaTag('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
  }, [title, description, noindex]);
}
