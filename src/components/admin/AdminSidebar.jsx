import './AdminSidebar.css';

const SECTIONS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'products', label: 'Products' },
  { key: 'gallery', label: 'Shop Gallery' },
  { key: 'offers', label: 'Offers' },
  { key: 'settings', label: 'Settings' },
];

export default function AdminSidebar({ active, onChange }) {
  return (
    <nav className="admin-sidebar" aria-label="Admin sections">
      {SECTIONS.map((section) => (
        <button
          key={section.key}
          type="button"
          className={`admin-sidebar__item ${active === section.key ? 'admin-sidebar__item--active' : ''}`}
          onClick={() => onChange(section.key)}
        >
          {section.label}
        </button>
      ))}
    </nav>
  );
}
