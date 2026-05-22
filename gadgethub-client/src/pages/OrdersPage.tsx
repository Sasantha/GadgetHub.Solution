// Orders Page - Display customer orders and tracking
// EXACTLY matching your backend OrdersController endpoints
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCustomer } from '../contexts/CustomerContext';
import { OrderService } from '../services/orderService';
import { Order } from '../types';
import '../orders.css';

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { customer } = useCustomer();

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (!customer) return;
        
        // Use OrderService to get customer's orders - matching your backend GET /api/orders/customer/{customerId}
        const response = await OrderService.getCustomerOrders(customer.id);
        
        if (response && response.success && response.data) {
          setOrders(response.data);
        } else {
          setOrders([]);
        }
      } catch (err: any) {
        console.error('Failed to load orders:', err);
        setError(err.message || 'Failed to load orders');
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [customer]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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

  if (isLoading) {
    return (
      <div className="container">
        <div className="orders-loading">
          <h2>Loading your orders...</h2>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="orders-error">
          <h2>❌ Error Loading Orders</h2>
          <p>{error}</p>
          <Link to="/products" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="orders-page">
        <div className="orders-header">
          <h1>📦 Your Orders</h1>
          {customer && (
            <p>Welcome back, <strong>{customer.firstName}!</strong> Here are your recent orders.</p>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="no-orders">
            <div className="no-orders-content">
              <h3>📋 No Orders Yet</h3>
              <p>You haven't placed any orders through The Gadget Hub.</p>
              <p>Start shopping and experience our 3-distributor quotation system!</p>
              <Link to="/products" className="btn btn-primary">
                🛍️ Start Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="orders-list">
            <div className="orders-summary">
              <h3>Order Summary</h3>
              <div className="summary-stats">
                <div className="stat-card">
                  <span className="stat-number">{orders.length}</span>
                  <span className="stat-label">Total Orders</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">
                    {formatPrice(orders.reduce((sum, order) => sum + order.totalAmount, 0))}
                  </span>
                  <span className="stat-label">Total Spent</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">
                    {orders.filter(order => order.status === 'delivered').length}
                  </span>
                  <span className="stat-label">Delivered</span>
                </div>
              </div>
            </div>

            <div className="orders-grid">
              {orders.map((order) => (
                <div key={order.id} className="order-card">
                  <div className="order-card-header">
                    <div className="order-info">
                      <h4>Order #{order.id.substring(0, 8)}...</h4>
                      <span className="order-date">{formatDate(order.placedAt)}</span>
                    </div>
                    <div 
                      className="order-status-badge"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {getStatusIcon(order.status)} {order.status.toUpperCase()}
                    </div>
                  </div>

                  <div className="order-details">
                    <div className="product-info">
                      <h5>{order.product?.name || 'Product'}</h5>
                      <p className="product-description">
                        {order.product?.description || 'No description available'}
                      </p>
                      <div className="product-meta">
                        <span className="quantity">Qty: {order.quantity}</span>
                        {order.product?.category && (
                          <span className="category">{order.product.category}</span>
                        )}
                        {order.product?.brand && (
                          <span className="brand">{order.product.brand}</span>
                        )}
                      </div>
                    </div>

                    <div className="distributor-info">
                      <h6>Distributor</h6>
                      <p>{order.distributor?.name || 'N/A'}</p>
                      <small>{order.distributor?.type || ''}</small>
                    </div>

                    <div className="pricing-info">
                      <div className="price-row">
                        <span>Price per unit:</span>
                        <span>{formatPrice(order.pricePerUnit)}</span>
                      </div>
                      <div className="price-row total">
                        <span>Total Amount:</span>
                        <span>{formatPrice(order.totalAmount)}</span>
                      </div>
                    </div>

                    {order.estimatedDelivery && (
                      <div className="delivery-info">
                        <span className="delivery-label">Estimated Delivery:</span>
                        <span className="delivery-date">
                          {formatDate(order.estimatedDelivery)}
                        </span>
                      </div>
                    )}

                    {order.distributorOrderId && (
                      <div className="tracking-info">
                        <span className="tracking-label">Tracking ID:</span>
                        <span className="tracking-id">{order.distributorOrderId}</span>
                      </div>
                    )}
                  </div>

                  <div className="order-actions">
                    {order.distributor?.contactInfo && (
                      <a 
                        href={`mailto:${order.distributor.contactInfo}`}
                        className="btn btn-secondary"
                      >
                        📞 Contact Distributor
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="orders-footer">
          <div className="help-section">
            <h3>❓ Need Help?</h3>
            <p>
              For order support, contact the distributor directly or browse our 
              <Link to="/products"> product catalog</Link> for new items.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage; 