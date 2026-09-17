import { useState } from 'react';
import SecurityNote from '../../components/admin/SecurityNote';
import AdminSidebar from '../../components/admin/AdminSidebar';
import DashboardOverview from '../../components/admin/DashboardOverview';
import ProductsManager from '../../components/admin/ProductsManager';
import ShopGalleryManager from '../../components/admin/ShopGalleryManager';
import OffersManager from '../../components/admin/OffersManager';
import SettingsPanel from '../../components/admin/SettingsPanel';
import { useDocumentHead } from '../../hooks/useDocumentHead';
import './AdminDashboard.css';

const SECTION_COMPONENTS = {
  dashboard: DashboardOverview,
  products: ProductsManager,
  gallery: ShopGalleryManager,
  offers: OffersManager,
  settings: SettingsPanel,
};

export default function AdminDashboard() {
  useDocumentHead({ title: 'Admin Dashboard', noindex: true });

  const [activeSection, setActiveSection] = useState('dashboard');
  const ActiveComponent = SECTION_COMPONENTS[activeSection];

  return (
    <div className="admin-dashboard">
      <SecurityNote />
      <div className="container admin-dashboard__grid">
        <AdminSidebar active={activeSection} onChange={setActiveSection} />
        <div className="admin-dashboard__content">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
}
