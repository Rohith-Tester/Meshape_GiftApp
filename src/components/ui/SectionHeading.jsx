import { Link } from 'react-router-dom';
import './SectionHeading.css';

export default function SectionHeading({ title, description, linkTo, linkLabel }) {
  return (
    <div className="section-heading">
      <div>
        <h2>{title}</h2>
        {description && <p className="section-heading__desc">{description}</p>}
      </div>
      {linkTo && (
        <Link to={linkTo} className="section-heading__link">
          {linkLabel || 'View all'}
        </Link>
      )}
    </div>
  );
}
