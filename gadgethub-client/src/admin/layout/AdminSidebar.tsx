// Admin Sidebar - Navigation for admin panel
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const { admin } = useAdmin();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/admin/quotations', icon: '📋', label: 'Quotations' },
    { path: '/admin/orders', icon: '📦', label: 'Orders' },
    { path: '/admin/customers', icon: '👥', label: 'Customers' },
    { path: '/admin/products', icon: '📱', label: 'Products' },
    { path: '/admin/distributors', icon: '🏢', label: 'Distributors' }
  ];

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <h2>🔧 Admin Panel</h2>
        <p>The Gadget Hub</p>
      </div>

      <nav className="admin-nav">
        <ul>
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link 
                to={item.path} 
                className={isActive(item.path) ? 'active' : ''}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="admin-profile">
          <div className="admin-avatar">
            {admin?.firstName?.charAt(0) || 'A'}
          </div>
          <div className="admin-info">
            <span className="admin-name">
              {admin?.firstName} {admin?.lastName}
            </span>
            <span className="admin-role">{admin?.role}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar; 