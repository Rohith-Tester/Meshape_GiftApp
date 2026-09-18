import './DataLoadError.css';

/**
 * Phase 10 QA fix: ProductsContext/OffersContext/ShopGalleryContext have
 * always exposed an `error` state (Phase 8), but no customer-facing page
 * ever read it — only the Admin dashboard did. That meant a genuine
 * connection failure (wrong Firebase config, network outage, security
 * rules misconfigured) would render to a customer as an empty catalogue
 * with zero explanation, indistinguishable from "this shop has no
 * products." This banner closes that gap without replacing the whole
 * page — sections that don't depend on the failed data (hero, shop
 * info, etc.) keep rendering normally alongside it.
 *
 * Fix (BUG-17): the banner used to be text only, telling the customer to
 * refresh the whole page themselves. The test plan expects a retry, and
 * the contexts now expose one that re-subscribes the failed Firestore
 * listener in place — so pass `onRetry` and the customer gets a button.
 */
export default function DataLoadError({
  message = "We're having trouble loading this right now.",
  onRetry,
  retrying = false,
}) {
  return (
    <div className="data-load-error" role="alert">
      <span aria-hidden="true">⚠️</span>{' '}
      <span className="data-load-error__text">
        {message}{' '}
        {onRetry ? 'Check your connection, then try again.' : 'Please refresh the page, or try again in a moment.'}
      </span>
      {onRetry && (
        <button type="button" className="data-load-error__retry" onClick={onRetry} disabled={retrying}>
          {retrying ? 'Retrying…' : 'Try Again'}
        </button>
      )}
    </div>
  );
}
