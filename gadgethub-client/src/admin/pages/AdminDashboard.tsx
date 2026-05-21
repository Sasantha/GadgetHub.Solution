// Simplified Admin Dashboard - Big Action Buttons Only
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminService } from '../../services/adminService';

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTime, setRefreshTime] = useState<string>('');
  const navigate = useNavigate();

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      setRefreshTime(new Date().toLocaleTimeString());
    } catch (err: any) {
      console.error('Dashboard loading error:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="admin-dashboard loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h2>Loading Dashboard...</h2>
          <p>Preparing admin panel</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard error">
        <div className="error-content">
          <h2>⚠️ Dashboard Error</h2>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadDashboardData}>
            🔄 Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard simplified">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>📊 Admin Dashboard</h1>
          <div className="refresh-info">
            <span>Last updated: {refreshTime}</span>
            <button className="btn btn-sm" onClick={loadDashboardData}>
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Big Action Buttons */}
      <div className="admin-actions">
        <h3>🚀 Quick Actions</h3>
        <div className="action-buttons">
          <button 
            className="action-btn orders"
            onClick={() => navigate('/admin/orders')}
          >
            <div className="action-icon">📦</div>
            <div className="action-content">
              <h4>Manage Orders</h4>
              <p>View and manage all customer orders</p>
            </div>
          </button>

          <button 
            className="action-btn customers"
            onClick={() => navigate('/admin/customers')}
          >
            <div className="action-icon">👥</div>
            <div className="action-content">
              <h4>Manage Customers</h4>
              <p>View and manage customer accounts</p>
            </div>
          </button>

          <button 
            className="action-btn products"
            onClick={() => navigate('/admin/products')}
          >
            <div className="action-icon">📱</div>
            <div className="action-content">
              <h4>Manage Products</h4>
              <p>Add, edit, and manage product catalog</p>
            </div>
          </button>

          <button 
            className="action-btn quotations"
            onClick={() => navigate('/admin/quotations')}
          >
            <div className="action-icon">📋</div>
            <div className="action-content">
              <h4>Manage Quotations</h4>
              <p>Handle quotation requests and responses</p>
            </div>
          </button>

          <button 
            className="action-btn distributors"
            onClick={() => navigate('/admin/distributors')}
          >
            <div className="action-icon">🏢</div>
            <div className="action-content">
              <h4>Manage Distributors</h4>
              <p>Manage distributor information</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 