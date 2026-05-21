import React, { useState, useEffect } from 'react';
import { AdminService } from '../../services/adminService';
import DataTable from '../components/DataTable';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: string;
}

const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const customersData = await AdminService.getAllCustomers();
      setCustomers(customersData || []);
    } catch (error) {
      console.error('Failed to load customers:', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerOrders = async (customerId: string) => {
    try {
      setLoadingOrders(true);
      const orders = await AdminService.getCustomerOrders(customerId);
      setCustomerOrders(orders || []);
    } catch (error) {
      console.error('Failed to load customer orders:', error);
      setCustomerOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleViewCustomer = async (customer: Customer) => {
    setSelectedCustomer(customer);
    await loadCustomerOrders(customer.id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getOrderStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'status-pending',
      confirmed: 'status-confirmed', 
      shipped: 'status-shipped',
      delivered: 'status-delivered'
    };
    
    return (
      <span className={`status-badge ${statusColors[status as keyof typeof statusColors] || 'status-default'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const columns = [
    {
      key: 'firstName',
      label: 'First Name',
      sortable: true
    },
    {
      key: 'lastName',
      label: 'Last Name',
      sortable: true
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (value: string) => (
        <a href={`mailto:${value}`} className="email-link">
          {value}
        </a>
      )
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (value: string) => value || 'Not provided'
    },
    {
      key: 'createdAt',
      label: 'Join Date',
      sortable: true,
      render: (value: string) => formatDate(value)
    }
  ];

  const customerActions = (customer: Customer) => (
    <div className="customer-actions">
      <button 
        className="btn-view"
        onClick={() => handleViewCustomer(customer)}
      >
        View Details
      </button>
    </div>
  );

  const customerStats = {
    totalCustomers: customers.length,
    newThisMonth: customers.filter(c => {
      const created = new Date(c.createdAt);
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length
  };

  return (
    <div className="admin-customers">
      <div className="admin-page-header">
        <h1>Customers Management</h1>
        <div className="page-actions">
          <button onClick={loadCustomers} className="btn-refresh" disabled={loading}>
            {loading ? '⟳' : '↻'} Refresh
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-card">
          <div className="stat-number">{customerStats.totalCustomers}</div>
          <div className="stat-label">Total Customers</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{customerStats.newThisMonth}</div>
          <div className="stat-label">New This Month</div>
        </div>
      </div>

      <div className="admin-content">
        <DataTable
          data={customers}
          columns={columns}
          searchFields={['firstName', 'lastName', 'email', 'phone']}
          actions={customerActions}
          loading={loading}
          onRowClick={handleViewCustomer}
        />
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="modal-overlay" onClick={() => setSelectedCustomer(null)}>
          <div className="modal-content customer-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Customer Details</h2>
              <button 
                className="modal-close"
                onClick={() => setSelectedCustomer(null)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="customer-details-grid">
                {/* Personal Information */}
                <div className="detail-section">
                  <h3>Personal Information</h3>
                  <div className="detail-row">
                    <span className="label">Customer ID:</span>
                    <span className="value">{selectedCustomer.id}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Name:</span>
                    <span className="value">
                      {selectedCustomer.firstName} {selectedCustomer.lastName}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Email:</span>
                    <span className="value">
                      <a href={`mailto:${selectedCustomer.email}`} className="email-link">
                        {selectedCustomer.email}
                      </a>
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Phone:</span>
                    <span className="value">{selectedCustomer.phone || 'Not provided'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Address:</span>
                    <span className="value">{selectedCustomer.address || 'Not provided'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Join Date:</span>
                    <span className="value">{formatDate(selectedCustomer.createdAt)}</span>
                  </div>
                </div>

                {/* Order History */}
                <div className="detail-section orders-section">
                  <h3>Order History</h3>
                  {loadingOrders ? (
                    <div className="loading-orders">Loading orders...</div>
                  ) : customerOrders.length === 0 ? (
                    <div className="no-orders">No orders found</div>
                  ) : (
                    <div className="orders-list">
                      {customerOrders.map(order => (
                        <div key={order.id} className="order-item">
                          <div className="order-header">
                            <span className="order-id">
                              Order #{order.id.substring(0, 8)}...
                            </span>
                            {getOrderStatusBadge(order.status)}
                          </div>
                          <div className="order-details">
                            <div className="order-product">
                              {order.product?.name || 'Unknown Product'}
                            </div>
                            <div className="order-meta">
                              <span className="quantity">Qty: {order.quantity}</span>
                              <span className="total">{formatCurrency(order.totalAmount)}</span>
                              <span className="date">{formatDate(order.placedAt)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Order Summary */}
                {customerOrders.length > 0 && (
                  <div className="detail-section summary-section">
                    <h3>Order Summary</h3>
                    <div className="summary-stats">
                      <div className="summary-item">
                        <span className="summary-label">Total Orders:</span>
                        <span className="summary-value">{customerOrders.length}</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Total Spent:</span>
                        <span className="summary-value">
                          {formatCurrency(
                            customerOrders.reduce((sum, order) => sum + order.totalAmount, 0)
                          )}
                        </span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Avg Order Value:</span>
                        <span className="summary-value">
                          {formatCurrency(
                            customerOrders.reduce((sum, order) => sum + order.totalAmount, 0) / customerOrders.length
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers; 