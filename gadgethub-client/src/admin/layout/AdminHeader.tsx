// Admin Header - Top bar with user info and actions
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';

const AdminHeader: React.FC = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { admin, logout } = useAdmin();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const getCurrentTime = () => {
    return new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="admin-header">
      <div className="header-left">
        <div className="breadcrumb">
          <span className="breadcrumb-item">Admin Panel</span>
        </div>
      </div>

      <div className="header-center">
        <div className="current-time">
          <span className="time-icon">🕒</span>
          <span className="time-text">{getCurrentTime()}</span>
        </div>
      </div>

      <div className="header-right">
        <div className="header-actions">
          <div className="user-menu">
            <button
              className="user-menu-trigger"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="user-avatar">
                <span className="avatar-icon">
                  {admin?.role === 'super_admin' ? '👑' : 
                   admin?.role === 'manager' ? '👔' : '👤'}
                </span>
              </div>
              <div className="user-details">
                <span className="user-name">{admin?.firstName} {admin?.lastName}</span>
                <small className="user-role">{admin?.role?.replace('_', ' ')}</small>
              </div>
              <span className="dropdown-arrow">
                {showUserMenu ? '▲' : '▼'}
              </span>
            </button>

            {showUserMenu && (
              <div className="user-dropdown">
                <div className="dropdown-header">
                  <div className="dropdown-user-info">
                    <h4>{admin?.firstName} {admin?.lastName}</h4>
                    <p>{admin?.email}</p>
                    <small>Role: {admin?.role?.replace('_', ' ')}</small>
                  </div>
                </div>
                
                <div className="dropdown-menu">
                  <button className="dropdown-item">
                    <span className="item-icon">👤</span>
                    <span>Profile Settings</span>
                  </button>
                  <button className="dropdown-item">
                    <span className="item-icon">🔑</span>
                    <span>Change Password</span>
                  </button>
                  <button className="dropdown-item">
                    <span className="item-icon">📊</span>
                    <span>Activity Log</span>
                  </button>
                  <div className="dropdown-divider"></div>
                  <button 
                    className="dropdown-item logout-item"
                    onClick={handleLogout}
                  >
                    <span className="item-icon">🚪</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader; 