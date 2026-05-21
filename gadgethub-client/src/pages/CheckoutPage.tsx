// Clean Checkout Page - Following Database Schema Exactly
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useCustomer } from '../contexts/CustomerContext';
import { QuotationService } from '../services/quotationService';
import { getApiUrl } from '../config/api';

type CheckoutStep = 'cart-review' | 'quotation-submitted' | 'quotes-ready' | 'order-placed';

interface QuotationRequest {
  id: string;
  customerId: string;
  productId: string;
  quantity: number;
  status: 'pending' | 'completed';
  requestedAt: string;
}

interface QuotationResponse {
  id: string;
  requestId: string;
  distributorId: string;
  productId: string;
  pricePerUnit: number;
  availableQuantity: number;
  estimatedDeliveryDays: number;
  respondedAt: string;
  distributorName?: string;
}

const CheckoutPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('cart-review');
  const [quotationRequestId, setQuotationRequestId] = useState<string | null>(null);
  const [quotationResponses, setQuotationResponses] = useState<QuotationResponse[]>([]);
  const [selectedResponse, setSelectedResponse] = useState<QuotationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { cartItems, clearCart } = useCart();
  const { customer, isAuthenticated } = useCustomer();
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    }
  }, [isAuthenticated, navigate]);

  // Step 1: Cart Review
  const handleRequestQuotation = async () => {
    if (!customer || cartItems.length === 0) return;

    try {
      setLoading(true);
      setError(null);

      // Request quotations for ALL cart items
      const quotationRequests = cartItems.map(item => 
        QuotationService.requestQuotation({
          customerId: customer.id,
          productId: item.productId,
          quantity: item.quantity
        })
      );

      // Send all quotation requests in parallel
      const responses = await Promise.all(quotationRequests);
      
      // Check if all requests were successful
      const successfulRequests = responses.filter(response => response.success && response.data);
      const failedRequests = responses.filter(response => !response.success);

      if (successfulRequests.length > 0) {
        // Store the first request ID for tracking (you can modify this logic as needed)
        setQuotationRequestId(successfulRequests[0].data!.id);
        setCurrentStep('quotation-submitted');
        
        // Clear the cart after successful quotation requests
        try {
          await clearCart();
        } catch (clearError) {
          console.warn('Failed to clear cart after quotation request:', clearError);
        }
        
        // Show success message with count of requests
        const successMessage = `✅ Quotation requests submitted successfully!\n\n` +
          `📋 ${successfulRequests.length} quotation request(s) submitted\n` +
          `❌ ${failedRequests.length} request(s) failed\n\n` +
          `You can track your quotation requests and responses on the quotations page.`;
        
        alert(successMessage);
        navigate('/quotations');
      } else {
        setError('Failed to submit any quotation requests');
      }
    } catch (err: any) {
      setError(err.message || 'Error submitting quotation requests');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Check for Quotation Responses
  const checkQuotationStatus = async () => {
    if (!quotationRequestId) return;

    try {
      setLoading(true);
      const response = await QuotationService.getQuotationResponses(quotationRequestId);
      
      if (response.success && response.data && response.data.length > 0) {
        setQuotationResponses(response.data);
        setCurrentStep('quotes-ready');
      }
    } catch (err: any) {
      console.error('Error checking quotation status:', err);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Place Order with Selected Quote
  const handlePlaceOrder = async () => {
    if (!selectedResponse || !customer) return;

    try {
      setLoading(true);
      setError(null);

      const orderData = {
        customerId: customer.id,
        distributorId: selectedResponse.distributorId,
        productId: selectedResponse.productId,
        quantity: cartItems[0].quantity,
        pricePerUnit: selectedResponse.pricePerUnit,
        totalAmount: selectedResponse.pricePerUnit * cartItems[0].quantity
      };

      // Call order creation API
      const response = await fetch(getApiUrl('/orders'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        setCurrentStep('order-placed');
        // Clear cart after successful order
        // await clearCart();
      } else {
        setError('Failed to place order');
      }
    } catch (err: any) {
      setError(err.message || 'Error placing order');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !customer) {
    return <div>Redirecting to login...</div>;
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1>🛒 Checkout Process</h1>
        
        {/* Progress Indicator */}
        <div className="checkout-progress">
          <div className={`step ${currentStep === 'cart-review' ? 'active' : 'completed'}`}>
            1. Review Cart
          </div>
          <div className={`step ${currentStep === 'quotation-submitted' ? 'active' : currentStep === 'quotes-ready' || currentStep === 'order-placed' ? 'completed' : ''}`}>
            2. Request Quotes
          </div>
          <div className={`step ${currentStep === 'quotes-ready' ? 'active' : currentStep === 'order-placed' ? 'completed' : ''}`}>
            3. Compare Quotes
          </div>
          <div className={`step ${currentStep === 'order-placed' ? 'active' : ''}`}>
            4. Place Order
          </div>
        </div>

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        {/* Step Content */}
        {currentStep === 'cart-review' && (
          <div className="step-content">
            <h2>📦 Review Your Cart</h2>
            {cartItems.length === 0 ? (
              <p>Your cart is empty. <a href="/products">Continue shopping</a></p>
            ) : (
              <>
                <div className="cart-items">
                  {cartItems.map(item => (
                    <div key={item.id} className="cart-item-summary">
                      <img src={item.product?.imageUrl || '/api/placeholder/100/100'} alt={item.product?.name} />
                      <div>
                        <h4>{item.product?.name}</h4>
                        <p>Quantity: {item.quantity}</p>
                        <p>Brand: {item.product?.brand}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="checkout-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={handleRequestQuotation}
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : '📋 Request Quotation from Distributors'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {currentStep === 'quotation-submitted' && (
          <div className="step-content">
            <h2>⏳ Quotation Request Submitted</h2>
            <p>Your quotation request has been submitted to our admin team.</p>
            <p><strong>Request ID:</strong> {quotationRequestId}</p>
            
            <div className="process-status">
              <div className="status-step completed">
                <span>✅</span> Request submitted successfully
              </div>
              <div className="status-step current">
                <span>🔄</span> Admin team contacting distributors
              </div>
              <div className="status-step pending">
                <span>⏳</span> Waiting for distributor quotes
              </div>
            </div>

            <div className="actions">
              <button 
                className="btn btn-secondary"
                onClick={checkQuotationStatus}
                disabled={loading}
              >
                {loading ? 'Checking...' : '🔍 Check for Quotes'}
              </button>
            </div>
          </div>
        )}

        {currentStep === 'quotes-ready' && (
          <div className="step-content">
            <h2>📊 Compare Distributor Quotes</h2>
            <p>We received {quotationResponses.length} quote(s) from our distributors:</p>
            
            <div className="quotes-comparison">
              {quotationResponses.map(response => (
                <div 
                  key={response.id} 
                  className={`quote-card ${selectedResponse?.id === response.id ? 'selected' : ''}`}
                  onClick={() => setSelectedResponse(response)}
                >
                  <h4>🏢 {response.distributorName || `Distributor ${response.distributorId}`}</h4>
                  <div className="quote-details">
                    <p><strong>Price per unit:</strong> ${response.pricePerUnit}</p>
                    <p><strong>Total:</strong> ${(response.pricePerUnit * cartItems[0].quantity).toFixed(2)}</p>
                    <p><strong>Available:</strong> {response.availableQuantity} units</p>
                    <p><strong>Delivery:</strong> {response.estimatedDeliveryDays} days</p>
                  </div>
                  {selectedResponse?.id === response.id && (
                    <div className="selected-indicator">✅ Selected</div>
                  )}
                </div>
              ))}
            </div>

            {selectedResponse && (
              <div className="checkout-actions">
                <button 
                  className="btn btn-primary"
                  onClick={handlePlaceOrder}
                  disabled={loading}
                >
                  {loading ? 'Placing Order...' : '🛍️ Place Order'}
                </button>
              </div>
            )}
          </div>
        )}

        {currentStep === 'order-placed' && (
          <div className="step-content">
            <h2>🎉 Order Placed Successfully!</h2>
            <p>Your order has been placed with the selected distributor.</p>
            <div className="order-summary">
              <h4>Order Details:</h4>
              <p><strong>Distributor:</strong> {selectedResponse?.distributorName}</p>
              <p><strong>Total Amount:</strong> ${selectedResponse ? (selectedResponse.pricePerUnit * cartItems[0].quantity).toFixed(2) : '0.00'}</p>
              <p><strong>Estimated Delivery:</strong> {selectedResponse?.estimatedDeliveryDays} days</p>
            </div>
            <div className="actions">
              <button className="btn btn-primary" onClick={() => navigate('/orders')}>
                📦 Track Your Orders
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/products')}>
                🛍️ Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage; 
