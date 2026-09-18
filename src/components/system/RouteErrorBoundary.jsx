import { useRouteError } from 'react-router-dom';
import { business } from '../../config/business';
import '../system/ErrorBoundary.css';

/**
 * Fix (NEW-19): the app's own <ErrorBoundary> wraps <RouterProvider>,
 * but React Router's data router catches render errors inside a route
 * FIRST and renders its own fallback — so the friendly error screen was
 * unreachable for essentially every real error. What customers actually
 * saw, in dev and in the production build alike, was React Router's
 * "Unexpected Application Error!" page complete with a JavaScript stack
 * trace naming internal files and functions.
 *
 * A route-level errorElement is the supported way to take that over.
 * This renders the same reassuring screen as ErrorBoundary, never shows
 * the customer the raw error, and logs the detail to the console for
 * whoever is debugging.
 */
export default function RouteErrorBoundary() {
  const error = useRouteError();

  // For local debugging and any future error-tracking hook — never for
  // the customer's eyes.
  // eslint-disable-next-line no-console
  console.error('Unhandled route error:', error);

  return (
    <div className="error-boundary">
      <div className="error-boundary__card">
        <h1>Something went wrong</h1>
        <p>
          We’re sorry — this page hit an unexpected error. Please try again, or reach us directly if it keeps
          happening.
        </p>
        <div className="error-boundary__actions">
          <button
            type="button"
            onClick={() => {
              window.location.href = '/';
            }}
            className="error-boundary__reload-btn"
          >
            Back to Home
          </button>
          <a
            href={`https://wa.me/${business.contact.orderWhatsappDigits}`}
            target="_blank"
            rel="noreferrer"
            className="error-boundary__whatsapp-link"
          >
            Message us on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
