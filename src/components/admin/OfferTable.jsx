import { getOfferStatus } from '../../utils/pricing';
import './OfferTable.css';

const STATUS_LABELS = {
  active: 'Active',
  scheduled: 'Scheduled',
  expired: 'Expired',
  inactive: 'Inactive',
};

function describeTarget(offer) {
  if (offer.appliesTo === 'all') return 'All Products';
  if (offer.appliesTo === 'category') return `Category: ${offer.targetId}`;
  return `Product: ${offer.targetId}`;
}

export default function OfferTable({ offers, onEdit, onDelete }) {
  if (offers.length === 0) {
    return <p className="offer-table__empty">No offers yet. Create your first one above.</p>;
  }

  return (
    <div className="offer-table">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Discount</th>
            <th>Applies To</th>
            <th>Dates</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {offers.map((offer) => {
            const status = getOfferStatus(offer);
            return (
              <tr key={offer.id}>
                <td>{offer.name}</td>
                <td>{offer.discountPercent}%</td>
                <td>{describeTarget(offer)}</td>
                <td>
                  {offer.startDate || '—'} → {offer.endDate || '—'}
                </td>
                <td>
                  <span className={`offer-table__status offer-table__status--${status}`}>{STATUS_LABELS[status]}</span>
                </td>
                <td className="offer-table__actions">
                  <button type="button" onClick={() => onEdit(offer)}>
                    Edit
                  </button>
                  <button type="button" className="offer-table__delete" onClick={() => onDelete(offer)}>
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
