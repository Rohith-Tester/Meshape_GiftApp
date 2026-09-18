import { Component } from 'react';
import { business } from '../../config/business';
import './ErrorBoundary.css';

/**
 * React error boundaries must be class components — there is no hook
 * equivalent as of React 18. This is the last line of defense per
 * Master Specification section 32 ("error handling") and section 37
 * ("error states") — without it, an unexpected render error anywhere in
 * the tree would produce a blank white page with no way back for the
 * customer, rather than a page that at least offers a reload and a way
 * to reach the shop directly.
 *
 * This intentionally does NOT try to catch or explain the specific
 * error to the customer (that's for browser/error-tracking tools, not
 * end-user copy) — it just guarantees there's always a usable page.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Logged for local/dev visibility. A production deployment would
    // typically also forward this to an error-tracking service — not
    // added here to avoid introducing a new dependency/vendor without
    // that being an explicit decision for this project.
    console.error('Unhandled error caught by ErrorBoundary:', error, info);
  }

  handleReload = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary__card">
            <h1>Something went wrong</h1>
            <p>
              We’re sorry — this page hit an unexpected error. Please try again, or reach us directly if it keeps
              happening.
            </p>
            <div className="error-boundary__actions">
              <button type="button" onClick={this.handleReload} className="error-boundary__reload-btn">
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

    return this.props.children;
  }
}
