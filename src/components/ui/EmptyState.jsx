import { Link } from 'react-router-dom';
import Button from './Button';
import './EmptyState.css';

/**
 * Shared visual for every "nothing here" moment: empty cart, empty
 * wishlist, no search results, product not found, expired offer, etc.
 * (Master Specification section 37.)
 */
export default function EmptyState({ icon, title, description, actionLabel, actionTo, onAction }) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state__icon">{icon}</div>}
      <h3 className="empty-state__title">{title}</h3>
      {description && <p className="empty-state__desc">{description}</p>}
      {actionLabel && actionTo && (
        <Button as={Link} to={actionTo} variant="primary">
          {actionLabel}
        </Button>
      )}
      {actionLabel && !actionTo && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
