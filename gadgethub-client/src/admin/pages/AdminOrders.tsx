import React, { useState, useEffect } from 'react';
import { AdminService } from '../../services/adminService';
import DataTable from '../components/DataTable';

interface Order {
  id: string;
  customerId: string;
  distributorId: string;
  productId: string;
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
  status: string;
  distributorOrderId?: string;
  estimatedDelivery?: string;
  placedAt: string;
  customer?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  distributor?: {
    name: string;
    type: string;
  };
  product?: {
    name: string;
    category: string;
    brand: string;
  };
}

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await AdminService.getAllOrders();
      setOrders(ordersData || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingStatus(true);
      await AdminService.updateOrderStatus(orderId, newStatus);
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      window.alert('Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: string) => {
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter orders by status
  const filteredOrders = orders.filter(order => 
    statusFilter === 'all' || order.status === statusFilter
  );

  const columns = [
    {
      key: 'id',
      label: 'Order ID',
      sortable: true,
      render: (value: string) => (
        <span className="order-id">{value.substring(0, 8)}...</span>
      )
    },
    {
      key: 'customer',
      label: 'Customer',
      sortable: true,
      render: (_: any, row: Order) => (
        <div className="customer-info">
          <div className="customer-name">
            {row.customer ? `${row.customer.firstName} ${row.customer.lastName}` : 'Unknown Customer'}
          </div>
          <div className="customer-email">{row.customer?.email || 'No email'}</div>
        </div>
      )
    },
    {
      key: 'product',
      label: 'Product',
      sortable: true,
      render: (_: any, row: Order) => (
        <div className="product-info">
          <div className="product-name">{row.product?.name || 'Unknown Product'}</div>
          <div className="product-details">{row.product?.category} • {row.product?.brand}</div>
        </div>
      )
    },
    {
      key: 'distributor',
      label: 'Distributor',
      sortable: true,
      render: (_: any, row: Order) => (
        <div className="distributor-info">
          <div className="distributor-name">{row.distributor?.name || 'Unknown'}</div>
          <div className="distributor-type">{row.distributor?.type}</div>
        </div>
      )
    },
    {
      key: 'quantity',
      label: 'Qty',
      sortable: true
    },
    {
      key: 'totalAmount',
      label: 'Total',
      sortable: true,
      render: (value: number) => formatCurrency(value)
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => getStatusBadge(value)
    },
    {
      key: 'placedAt',
      label: 'Placed At',
      sortable: true,
      render: (value: string) => formatDate(value)
    }
  ];

  const orderActions = (order: Order) => (
    <div className="order-actions">
      <button 
        className="btn-view"
        onClick={() => setSelectedOrder(order)}
      >
        View
      </button>
      <select 
        value={order.status}
        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
        disabled={updatingStatus}
        className="status-select"
      >
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
        <option value="shipped">Shipped</option>
        <option value="delivered">Delivered</option>
      </select>
    </div>
  );

  return (
    <div className="admin-orders">
      <div className="admin-page-header">
        <h1>Orders Management</h1>
        <div className="page-actions">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>
          <button onClick={loadOrders} className="btn-refresh" disabled={loading}>
            {loading ? '⟳' : '↻'} Refresh
          </button>
        </div>
      </div>

      <div className="admin-content">
        <DataTable
          data={filteredOrders}
          columns={columns}
          searchFields={['customer.firstName', 'customer.lastName', 'customer.email', 'product.name', 'distributor.name']}
          actions={orderActions}
          loading={loading}
        />
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content order-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details</h2>
              <button 
                className="modal-close"
                onClick={() => setSelectedOrder(null)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="order-details-grid">
                <div className="detail-section">
                  <h3>Order Information</h3>
                  <div className="detail-row">
                    <span className="label">Order ID:</span>
                    <span className="value">{selectedOrder.id}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Status:</span>
                    <span className="value">{getStatusBadge(selectedOrder.status)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Placed At:</span>
                    <span className="value">{formatDate(selectedOrder.placedAt)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Estimated Delivery:</span>
                    <span className="value">
                      {selectedOrder.estimatedDelivery 
                        ? formatDate(selectedOrder.estimatedDelivery)
                        : 'Not set'
                      }
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Customer Information</h3>
                  <div className="detail-row">
                    <span className="label">Name:</span>
                    <span className="value">
                      {selectedOrder.customer 
                        ? `${selectedOrder.customer.firstName} ${selectedOrder.customer.lastName}`
                        : 'Unknown Customer'
                      }
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Email:</span>
                    <span className="value">{selectedOrder.customer?.email || 'No email'}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Product Information</h3>
                  <div className="detail-row">
                    <span className="label">Product:</span>
                    <span className="value">{selectedOrder.product?.name || 'Unknown Product'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Category:</span>
                    <span className="value">{selectedOrder.product?.category || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Brand:</span>
                    <span className="value">{selectedOrder.product?.brand || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Quantity:</span>
                    <span className="value">{selectedOrder.quantity}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Price per Unit:</span>
                    <span className="value">{formatCurrency(selectedOrder.pricePerUnit)}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Distributor Information</h3>
                  <div className="detail-row">
                    <span className="label">Distributor:</span>
                    <span className="value">{selectedOrder.distributor?.name || 'Unknown'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Type:</span>
                    <span className="value">{selectedOrder.distributor?.type || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Distributor Order ID:</span>
                    <span className="value">{selectedOrder.distributorOrderId || 'Not assigned'}</span>
                  </div>
                </div>

                <div className="detail-section total-section">
                  <h3>Order Total</h3>
                  <div className="total-amount">
                    {formatCurrency(selectedOrder.totalAmount)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders; 