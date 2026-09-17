import './RouteLoadingFallback.css';

export default function RouteLoadingFallback() {
  return (
    <div className="route-loading-fallback" role="status" aria-live="polite">
      <span className="route-loading-fallback__spinner" aria-hidden="true" />
      Loading…
    </div>
  );
}
