import './PhasePlaceholder.css';

/**
 * Temporary content block for routes whose real content arrives in a
 * later phase. Keeps every page reachable and on-brand from Phase 1
 * onward instead of shipping blank routes.
 */
export default function PhasePlaceholder({ title, description, phaseNote }) {
  return (
    <section className="phase-placeholder">
      <div className="container phase-placeholder__inner">
        <h1>{title}</h1>
        {description && <p className="phase-placeholder__desc">{description}</p>}
        {phaseNote && <p className="phase-placeholder__note">{phaseNote}</p>}
      </div>
    </section>
  );
}
