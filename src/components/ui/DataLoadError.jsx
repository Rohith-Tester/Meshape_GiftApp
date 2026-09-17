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
 */
export default function DataLoadError({ message = "We're having trouble loading this right now." }) {
  return (
    <div className="data-load-error" role="alert">
      <span aria-hidden="true">⚠️</span> {message} Please refresh the page, or try again in a moment.
    </div>
  );
}
