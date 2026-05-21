// Customer Quotations Page - Track quotation requests and responses
import React, { useState, useEffect, useCallback } from 'react';
import { useCustomer } from '../contexts/CustomerContext';
import { useNotifications } from '../contexts/NotificationContext';
import { QuotationService } from '../services/quotationService';
import { OrderService } from '../services/orderService';
import { QuotationRequest, QuotationResponse } from '../types';

const CustomerQuotations: React.FC = () => {
  const { customer, isAuthenticated } = useCustomer();
  const { markAllResponsesAsSeen } = useNotifications();
  const [quotationRequests, setQuotationRequests] = useState<QuotationRequest[]>([]);
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [placingOrder, setPlacingOrder] = useState<string | null>(null); // Track which order is being placed

  const loadCustomerQuotations = useCallback(async () => {
    if (!customer) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await QuotationService.getCustomerQuotations(customer.id);
      if (response.success && response.data) {
        setQuotationRequests(response.data);
      } else {
        setError('Failed to load quotation requests');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load quotation requests');
    } finally {
      setLoading(false);
    }
  }, [customer]);

  useEffect(() => {
    if (isAuthenticated && customer) {
      loadCustomerQuotations();
      // Mark all responses as seen when customer visits the page
      markAllResponsesAsSeen();
    }
  }, [isAuthenticated, customer, loadCustomerQuotations, markAllResponsesAsSeen]);

  const loadQuotationResponses = async (requestId: string) => {
    try {
      const response = await QuotationService.getQuotationResponses(requestId);
      if (response.success && response.data) {
        // Update the specific request with responses
        setQuotationRequests(prev => prev.map(req => 
          req.id === requestId 
            ? { ...req, quotationResponses: response.data }
            : req
        ));
      }
    } catch (err: any) {
      console.error('Failed to load responses:', err);
    }
  };

  const handleExpandRequest = (requestId: string) => {
    if (expandedRequest === requestId) {
      setExpandedRequest(null);
    } else {
      setExpandedRequest(requestId);
      // Load responses when expanding
      const request = quotationRequests.find(req => req.id === requestId);
      if (request && (!request.quotationResponses || request.quotationResponses.length === 0)) {
        loadQuotationResponses(requestId);
      }
    }
  };

  const handlePlaceOrder = async (quotationRequest: QuotationRequest, quotationResponse: QuotationResponse) => {
    if (!customer) {
      alert('Please log in to place an order');
      return;
    }

    if (!window.confirm(`Are you sure you want to place an order for ${quotationRequest.quantity} units of ${quotationRequest.product?.name || 'this product'} at $${quotationResponse.pricePerUnit} per unit?`)) {
      return;
    }

    try {
      setPlacingOrder(quotationResponse.id);
      
      const orderRequest = {
        customerId: customer.id,
        distributorId: quotationResponse.distributorId,
        productId: quotationResponse.productId,
        quantity: quotationRequest.quantity,
        pricePerUnit: quotationResponse.pricePerUnit
      };

      const response = await OrderService.createOrder(orderRequest);
      
      if (response.success && response.data) {
        alert(`✅ Order placed successfully!\n\nOrder ID: ${response.data.id}\nTotal Amount: $${response.data.totalAmount}\nEstimated Delivery: ${quotationResponse.estimatedDeliveryDays} days`);
        
        // Refresh the quotation requests to update status
        await loadCustomerQuotations();
      } else {
        alert(`❌ Failed to place order: ${response.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      alert(`❌ Error placing order: ${err.message || 'Unknown error'}`);
    } finally {
      setPlacingOrder(null);
    }
  };

  const getCalculatedStatus = (request: QuotationRequest) => {
    const responseCount = request.quotationResponses?.length || 0;
    return responseCount >= 3 ? 'completed' : 'pending';
  };

  const getStatusColor = (request: QuotationRequest) => {
    const status = getCalculatedStatus(request);
    switch (status) {
      case 'pending': return 'text-warning';
      case 'completed': return 'text-success';
      default: return 'text-muted';
    }
  };

  const getStatusIcon = (request: QuotationRequest) => {
    const status = getCalculatedStatus(request);
    switch (status) {
      case 'pending': return '⏳';
      case 'completed': return '✅';
      default: return '❓';
    }
  };

  if (!isAuthenticated || !customer) {
    return (
      <div className="customer-quotations">
        <div className="container">
          <div className="auth-required">
            <h2>🔐 Authentication Required</h2>
            <p>Please log in to view your quotation requests.</p>
            <a href="/login" className="btn btn-primary">Login</a>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="customer-quotations">
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading your quotation requests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-quotations">
      <div className="container">
                 <div className="quotations-header">
           <h1>📋 My Quotation Requests</h1>
           <p>Track your quotation requests and view distributor responses</p>
                       <div className="header-actions">
              <button className="btn btn-secondary" onClick={loadCustomerQuotations}>
                🔄 Refresh
              </button>
            </div>
         </div>

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        {quotationRequests.length === 0 ? (
          <div className="empty-state">
            <h3>📭 No Quotation Requests Found</h3>
            <p>You haven't made any quotation requests yet.</p>
            <a href="/products" className="btn btn-primary">Browse Products</a>
          </div>
        ) : (
          <div className="quotations-list">
            {quotationRequests.map((request) => (
              <div key={request.id} className="quotation-request-card">
                <div className="request-header">
                                     <div className="request-info">
                     <h4>{request.product?.name || `Product ${request.productId}`}</h4>
                     <p className="product-id">ID: {request.productId}</p>
                     {request.product?.brand && <p className="brand">{request.product.brand}</p>}
                     <div className="request-details">
                       <span><strong>Quantity:</strong> {request.quantity}</span>
                       <span><strong>Requested:</strong> {new Date(request.requestedAt).toLocaleDateString()}</span>
                     </div>
                    <div className="response-progress">
                      <div className="response-progress-bar">
                        <div 
                          className="response-progress-fill" 
                          style={{ 
                            width: `${Math.min((request.quotationResponses?.length || 0) / 3 * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                      <div className="response-progress-text">
                        {request.quotationResponses?.length || 0}/3 responses received
                      </div>
                    </div>
                  </div>
                                     <div className="request-status">
                     <span className={`status-badge ${getStatusColor(request)}`}>
                       {getStatusIcon(request)} {getCalculatedStatus(request)}
                     </span>
                     <button 
                       className="btn btn-sm btn-outline"
                       onClick={() => handleExpandRequest(request.id)}
                     >
                       {expandedRequest === request.id ? '📖 Hide Details' : '📖 View Details'}
                     </button>
                   </div>
                </div>

                {expandedRequest === request.id && (
                  <div className="request-details-expanded">
                    {request.product?.imageUrl && (
                      <div className="product-image">
                        <img src={request.product.imageUrl} alt={request.product.name} />
                      </div>
                    )}
                    
                    <div className="responses-section">
                      <h5>🏢 Distributor Responses</h5>
                      {request.quotationResponses && request.quotationResponses.length > 0 ? (
                        <div className="responses-grid">
                          {request.quotationResponses.map((response) => (
                            <div key={response.id} className="response-card">
                              <div className="distributor-info">
                                <h6>{response.distributor?.name || `Distributor ${response.distributorId}`}</h6>
                                <span className="distributor-type">{response.distributor?.type}</span>
                              </div>
                              <div className="response-details">
                                <div className="price-info">
                                  <span className="price">${response.pricePerUnit}</span>
                                  <span className="price-label">per unit</span>
                                </div>
                                <div className="delivery-info">
                                  <span><strong>Available:</strong> {response.availableQuantity} units</span>
                                  <span><strong>Delivery:</strong> {response.estimatedDeliveryDays} days</span>
                                </div>
                                <div className="total-info">
                                  <span className="total-price">
                                    Total: ${(response.pricePerUnit * request.quantity).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                              <div className="response-actions">
                                <button 
                                  className="btn btn-primary btn-sm"
                                  onClick={() => handlePlaceOrder(request, response)}
                                  disabled={placingOrder === response.id}
                                >
                                  {placingOrder === response.id ? '⏳ Placing Order...' : '🛒 Place Order'}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="no-responses">
                          <p>⏳ No distributor responses yet. Our admin team is contacting distributors.</p>
                          <p>Check back later for pricing and availability.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerQuotations; 