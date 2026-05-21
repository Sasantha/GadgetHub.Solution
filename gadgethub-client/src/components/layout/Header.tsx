// Header Component - Navigation bar with customer authentication
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useCustomer } from '../../contexts/CustomerContext';
import NotificationDropdown from '../common/NotificationDropdown';

const Header: React.FC = () => {
  const { cartItems } = useCart();
  const { isAuthenticated, customer, logout } = useCustomer();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="logo">
          <Link to="/">
            <h1>The Gadget Hub</h1>
          </Link>
        </div>

        <nav className="main-nav">
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          <Link to="/orders">Orders</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </nav>

        <div className="header-actions">
          {/* Notifications */}
          {isAuthenticated && customer && (
            <NotificationDropdown />
          )}

          {/* Cart Icon */}
          <div className="cart-icon">
            <Link to="/cart">
              🛒
              {totalItems > 0 && (
                <span className="cart-badge">{totalItems}</span>
              )}
            </Link>
          </div>

          {/* Customer Authentication */}
          <div className="customer-auth">
            {isAuthenticated && customer ? (
              <div className="user-menu">
                <button 
                  className="user-menu-trigger"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div className="user-avatar">
                    {customer.firstName.charAt(0).toUpperCase()}
                  </div>
                  <span className="user-name">{customer.firstName}</span>
                  <span className="dropdown-arrow">▼</span>
                </button>

                {showUserMenu && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <div className="user-info">
                        <strong>{customer.firstName} {customer.lastName}</strong>
                        <small>{customer.email}</small>
                      </div>
                    </div>
                    <div className="dropdown-menu">
                      <Link 
                        to="/orders" 
                        onClick={() => setShowUserMenu(false)}
                        className="dropdown-item"
                      >
                        📦 My Orders
                      </Link>
                      <Link 
                        to="/quotations" 
                        onClick={() => setShowUserMenu(false)}
                        className="dropdown-item"
                      >
                        📋 My Quotations
                      </Link>
                      <Link 
                        to="/cart" 
                        onClick={() => setShowUserMenu(false)}
                        className="dropdown-item"
                      >
                        🛒 My Cart
                      </Link>
                      <hr className="dropdown-divider" />
                      <button 
                        onClick={handleLogout}
                        className="dropdown-item logout-btn"
                      >
                        🚪 Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : customer ? (
              // Show default customer with login prompt
              <div className="auth-buttons">
                <div className="default-user-info">
                  <span>👤 Demo User: {customer.firstName}</span>
                </div>
                <Link to="/login" className="auth-btn login-btn">
                  🔐 Login for Full Access
                </Link>
                <Link to="/register" className="auth-btn register-btn">
                  ✨ Sign Up
                </Link>
              </div>
            ) : (
              // No customer at all
              <div className="auth-buttons">
                <Link to="/login" className="auth-btn login-btn">
                  🔐 Sign In
                </Link>
                <Link to="/register" className="auth-btn register-btn">
                  ✨ Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 