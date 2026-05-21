// Cart Page - Shopping cart with items and checkout button
// EXACTLY matching your backend CartItem model and CartController endpoints
import React from 'react';
import { Link } from 'react-router-dom';
import type { CartItem } from '../types';
import { useCart } from '../contexts/CartContext';
import { useCustomer } from '../contexts/CustomerContext';
import CartItemComponent from '../components/cart/CartItemComponent';
import CartSummary from '../components/cart/CartSummary';

const CartPage: React.FC = () => {
  const { cartItems, isLoading, error, removeFromCart, updateCartItem } = useCart();
  const { customer } = useCustomer();

  const groupedProducts = cartItems.reduce((acc, item) => {
    const key = item.productId;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<string, CartItem[]>);

  // Loading state
  if (isLoading) {
    return (
      <div className="page-container">
        <h1>🛒 Shopping Cart</h1>
        <div className="cart-loading">
          <div className="loading-spinner"></div>
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="page-container">
        <h1>🛒 Shopping Cart</h1>
        <div className="cart-error">
          <p className="error-message">❌ {error}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container">
        <div className="empty-cart">
          <div className="empty-cart-content">
            <div className="empty-cart-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Discover amazing gadgets and add them to your cart!</p>
            
            {customer && (
              <div className="customer-welcome">
                <p>Welcome back, <strong>{customer.firstName}!</strong></p>
              </div>
            )}
            
            <div className="empty-cart-suggestions">
              <h3>Popular Categories:</h3>
              <div className="category-suggestions">
                <Link to="/products" className="category-link">📱 Smartphones</Link>
                <Link to="/products" className="category-link">💻 Laptops</Link>
                <Link to="/products" className="category-link">🎧 Audio</Link>
              </div>
            </div>
            
            <Link to="/products" className="btn btn-primary">
              🛍️ Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Cart with items
  return (
    <div className="page-container">
      <div className="cart-header">
        <h1>🛒 Shopping Cart</h1>
        {customer && (
          <div className="cart-customer-info">
            <p>Welcome back, <strong>{customer.firstName}!</strong></p>
          </div>
        )}
      </div>

      <div className="cart-content">
        {/* Cart Items List */}
        <div className="cart-items-section">
          <div className="cart-items-header">
            <h3>Items in Your Cart ({cartItems.length})</h3>
          </div>
          
          <div className="cart-items-list">
            {cartItems.map((cartItem) => (
              <CartItemComponent
                key={cartItem.id}
                cartItem={cartItem}
              />
            ))}
          </div>
        </div>

        {/* Cart Summary */}
        <div className="cart-summary-section">
          <CartSummary cartItems={cartItems} />
        </div>
      </div>

      {/* Gadget Hub Process Info */}
      <div className="cart-process-info">
        <h3>🔄 What Happens Next?</h3>
        <div className="process-steps-horizontal">
          <div className="process-step">
            <div className="step-icon">1️⃣</div>
            <div className="step-content">
              <h4>Review Your Cart</h4>
              <p>Make sure you have everything you want</p>
            </div>
          </div>
          <div className="step-arrow">→</div>
          <div className="process-step">
            <div className="step-icon">2️⃣</div>
            <div className="step-content">
              <h4>Get Quotes</h4>
              <p>We'll contact TechWorld, ElectroCom & Gadget Central</p>
            </div>
          </div>
          <div className="step-arrow">→</div>
          <div className="process-step">
            <div className="step-icon">3️⃣</div>
            <div className="step-content">
              <h4>Best Prices</h4>
              <p>You'll see the best deals automatically</p>
            </div>
          </div>
          <div className="step-arrow">→</div>
          <div className="process-step">
            <div className="step-icon">4️⃣</div>
            <div className="step-content">
              <h4>Fast Delivery</h4>
              <p>We'll handle orders with selected distributors</p>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Shopping */}
      <div className="cart-footer">
        <Link to="/products" className="continue-shopping-link">
          ← Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default CartPage; 