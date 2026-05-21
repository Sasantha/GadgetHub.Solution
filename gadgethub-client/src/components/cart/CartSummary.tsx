// CartSummary Component - Cart totals and checkout
// Matching your Gadget Hub business process (quotations → orders)
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CartItem } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { useCustomer } from '../../contexts/CustomerContext';

interface CartSummaryProps {
  cartItems: CartItem[];
  onClearCart?: () => void;
  onProceedToCheckout?: () => void;
}

const CartSummary: React.FC<CartSummaryProps> = ({
  cartItems,
  onClearCart,
  onProceedToCheckout
}) => {
  const [isClearing, setIsClearing] = useState(false);
  
  const { clearCart, getCartItemCount } = useCart();
  const { customer } = useCustomer();

  // Calculate totals
  const totalItems = getCartItemCount();
  const uniqueProducts = cartItems.length;

  // Handle clear cart - using your exact CartController DELETE /api/cart/{customerId}/clear
  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) return;
    
    try {
      setIsClearing(true);
      
      if (onClearCart) {
        onClearCart();
      } else {
        await clearCart();
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      alert('Error clearing cart');
    } finally {
      setIsClearing(false);
    }
  };

  const handleProceedToCheckout = () => {
    if (onProceedToCheckout) {
      onProceedToCheckout();
    }
  };

  // Group items by category for display
  const itemsByCategory = cartItems.reduce((acc, item) => {
    const category = item.product?.category || 'Uncategorized';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, CartItem[]>);

  return (
    <div className="cart-summary">
      <div className="cart-summary-header">
        <h3>🛒 Cart Summary</h3>
        {customer && (
          <p className="customer-info">
            Shopping as: <strong>{customer.firstName} {customer.lastName}</strong>
          </p>
        )}
      </div>

      {/* Cart Statistics */}
      <div className="cart-stats">
        <div className="stat-item">
          <span className="stat-label">Total Items:</span>
          <span className="stat-value">{totalItems}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Unique Products:</span>
          <span className="stat-value">{uniqueProducts}</span>
        </div>
      </div>

      {/* Items by Category */}
      {Object.keys(itemsByCategory).length > 0 && (
        <div className="cart-categories">
          <h4>Items by Category</h4>
          {Object.entries(itemsByCategory).map(([category, items]) => (
            <div key={category} className="category-group">
              <div className="category-header">
                <span className="category-name">{category}</span>
                <span className="category-count">
                  {items.reduce((sum, item) => sum + item.quantity, 0)} items
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pricing Information */}
      <div className="pricing-info">
        <div className="pricing-note">
          <h4>💰 Pricing Process</h4>
          <p>
            Prices will be determined after we get quotes from our 3 distributors:
          </p>
          <ul className="distributors-list">
            <li>🏢 <strong>TechWorld</strong></li>
            <li>⚡ <strong>ElectroCom</strong></li>
            <li>🔧 <strong>Gadget Central</strong></li>
          </ul>
          <p className="process-explanation">
            We'll compare their prices and availability to get you the best deal!
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="cart-actions">
        <button
          type="button"
          className="clear-cart-btn"
          onClick={handleClearCart}
          disabled={isClearing || cartItems.length === 0}
        >
          {isClearing ? (
            <>
              <span className="loading-spinner-small"></span>
              Clearing...
            </>
          ) : (
            '🗑️ Clear Cart'
          )}
        </button>

        {cartItems.length > 0 ? (
          <Link
            to="/checkout"
            className="btn btn-primary checkout-btn"
            onClick={handleProceedToCheckout}
          >
            📋 Get Quotes & Checkout
          </Link>
        ) : (
          <Link to="/products" className="btn btn-primary">
            🛍️ Continue Shopping
          </Link>
        )}
      </div>

      {/* Help Text */}
      <div className="cart-help">
        <h5>❓ How It Works</h5>
        <ol className="process-steps-mini">
          <li>Add products to your cart</li>
          <li>Click "Get Quotes & Checkout"</li>
          <li>We request quotes from all distributors</li>
          <li>You see the best prices automatically</li>
          <li>We place orders with selected distributors</li>
          <li>You get the best deals and fast delivery!</li>
        </ol>
      </div>
    </div>
  );
};

export default CartSummary; 