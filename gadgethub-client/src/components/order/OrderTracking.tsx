// OrderTracking Component - Track order status and delivery
// EXACTLY matching your backend Order model and OrdersController
import React, { useState, useEffect } from 'react';
import { Order } from '../../types';
import { OrderService } from '../../services';

interface OrderTrackingProps {
  orderId: string;
  onError: (error: string) => void;
}

const OrderTracking: React.FC<OrderTrackingProps> = ({
  orderId,
  onError
}) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load order details - matching your backend GET /api/orders/{id}
  const fetchOrderDetails = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await OrderService.getOrderById(orderId);
      
      if (response.success && response.data) {
        setOrder(response.data);
      } else {
        onError(response.error || 'Failed to load order details');
      }
    } catch (error) {
      console.error('Error loading order details:', error);
      onError('Error connecting to order service');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const handleRefresh = () => {
    fetchOrderDetails(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return '#ff9800';
      case 'confirmed': return '#2196f3';
      case 'shipped': return '#9c27b0';
      case 'delivered': return '#4caf50';
      default: return '#666';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return '⏳';
      case 'confirmed': return '✅';
      case 'shipped': return '🚚';
      case 'delivered': return '📦';
      default: return '❓';
    }
  };

  const getStatusProgress = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 25;
      case 'confirmed': return 50;
      case 'shipped': return 75;
      case 'delivered': return 100;
      default: return 0;
    }
  };

  if (loading) {
    return (
      <div className="order-tracking-loading">
        <div className="loading-content">
          <span className="loading-spinner"></span>
          <h3>Loading Order Details...</h3>
          <p>Fetching the latest information about your order</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-tracking-error">
        <h3>❌ Order Not Found</h3>
        <p>Unable to find order with ID: {orderId}</p>
      </div>
    );
  }

  return (
    <div className="order-tracking">
      <div className="order-tracking-header">
        <h3>📦 Step 7: Track Your Order</h3>
        <div className="order-header-actions">
          <button
            className="btn btn-secondary refresh-btn"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <>
                <span className="loading-spinner-small"></span>
                Refreshing...
              </>
            ) : (
              '🔄 Refresh Status'
            )}
          </button>
        </div>
      </div>

      <div className="order-summary-card">
        <div className="order-id-section">
          <h4>Order #{order.id}</h4>
          <div className="order-status">
            <span 
              className="status-badge"
              style={{ backgroundColor: getStatusColor(order.status) }}
            >
              {getStatusIcon(order.status)} {order.status.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="order-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ 
                width: `${getStatusProgress(order.status)}%`,
                backgroundColor: getStatusColor(order.status)
              }}
            ></div>
          </div>
          <div className="progress-labels">
            <span className={order.status === 'pending' ? 'active' : 'completed'}>Pending</span>
            <span className={order.status === 'confirmed' ? 'active' : order.status === 'shipped' || order.status === 'delivered' ? 'completed' : ''}>Confirmed</span>
            <span className={order.status === 'shipped' ? 'active' : order.status === 'delivered' ? 'completed' : ''}>Shipped</span>
            <span className={order.status === 'delivered' ? 'active' : ''}>Delivered</span>
          </div>
        </div>
      </div>

      <div className="order-details-section">
        <h4>📋 Order Details</h4>
        <div className="order-details-grid">
          <div className="detail-group">
            <h5>Product Information</h5>
            <div className="detail-item">
              <span className="label">Product ID:</span>
              <span className="value">{order.productId}</span>
            </div>
            <div className="detail-item">
              <span className="label">Product Name:</span>
              <span className="value">{order.product?.name || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Quantity:</span>
              <span className="value">{order.quantity} units</span>
            </div>
            <div className="detail-item">
              <span className="label">Price per unit:</span>
              <span className="value">{formatPrice(order.pricePerUnit)}</span>
            </div>
            <div className="detail-item total">
              <span className="label">Total Amount:</span>
              <span className="value">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>

          <div className="detail-group">
            <h5>Distributor Information</h5>
            <div className="detail-item">
              <span className="label">Distributor:</span>
              <span className="value">{order.distributor?.name || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Type:</span>
              <span className="value">{order.distributor?.type || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Contact:</span>
              <span className="value">{order.distributor?.contactInfo || 'N/A'}</span>
            </div>
            {order.distributorOrderId && (
              <div className="detail-item">
                <span className="label">Distributor Order ID:</span>
                <span className="value">{order.distributorOrderId}</span>
              </div>
            )}
          </div>

          <div className="detail-group">
            <h5>Delivery Information</h5>
            <div className="detail-item">
              <span className="label">Customer:</span>
              <span className="value">{order.customer?.firstName} {order.customer?.lastName}</span>
            </div>
            <div className="detail-item">
              <span className="label">Delivery Address:</span>
              <span className="value">{order.customer?.address || 'N/A'}</span>
            </div>
            {order.estimatedDelivery && (
              <div className="detail-item">
                <span className="label">Estimated Delivery:</span>
                <span className="value">{new Date(order.estimatedDelivery).toLocaleDateString()}</span>
              </div>
            )}
            <div className="detail-item">
              <span className="label">Order Placed:</span>
              <span className="value">{formatDate(order.placedAt)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="order-timeline">
        <h4>📅 Order Timeline</h4>
        <div className="timeline">
          <div className={`timeline-item ${order.status !== 'pending' ? 'completed' : 'current'}`}>
            <div className="timeline-marker">⏳</div>
            <div className="timeline-content">
              <h5>Order Placed</h5>
              <p>Your order has been received and is being processed</p>
              <small>{formatDate(order.placedAt)}</small>
            </div>
          </div>

          <div className={`timeline-item ${
            order.status === 'confirmed' ? 'current' : 
            order.status === 'shipped' || order.status === 'delivered' ? 'completed' : ''
          }`}>
            <div className="timeline-marker">✅</div>
            <div className="timeline-content">
              <h5>Order Confirmed</h5>
              <p>Distributor has confirmed your order and begun preparation</p>
              {order.distributorOrderId && <small>Tracking ID: {order.distributorOrderId}</small>}
            </div>
          </div>

          <div className={`timeline-item ${
            order.status === 'shipped' ? 'current' : 
            order.status === 'delivered' ? 'completed' : ''
          }`}>
            <div className="timeline-marker">🚚</div>
            <div className="timeline-content">
              <h5>Order Shipped</h5>
              <p>Your order is on its way to the delivery address</p>
              {order.estimatedDelivery && (
                <small>Expected: {new Date(order.estimatedDelivery).toLocaleDateString()}</small>
              )}
            </div>
          </div>

          <div className={`timeline-item ${order.status === 'delivered' ? 'completed' : ''}`}>
            <div className="timeline-marker">📦</div>
            <div className="timeline-content">
              <h5>Order Delivered</h5>
              <p>Your order has been successfully delivered</p>
            </div>
          </div>
        </div>
      </div>

      <div className="order-actions">
        <div className="action-info">
          <p>
            <strong>Need help?</strong> Contact the distributor directly at {' '}
            <a href={`mailto:${order.distributor?.contactInfo}`}>
              {order.distributor?.contactInfo}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking; 