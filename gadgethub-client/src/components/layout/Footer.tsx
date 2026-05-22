// Footer Component - Site footer with links and company information
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>The Gadget Hub</h3>
            <p>Your one-stop destination for the latest gadgets from trusted distributors. 
               We connect you with TechWorld, ElectroCom, and Gadget Central to find 
               the best prices and fastest delivery times.</p>
            <div className="footer-social">
              <span>Follow us:</span>
              <a href="https://www.facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">📘</a>
              <a href="https://www.twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">🐦</a>
              <a href="https://www.instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">📷</a>
              <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">💼</a>
            </div>
          </div>
          
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">Products</Link></li>
              <li><Link to="/orders">My Orders</Link></li>
              <li><Link to="/cart">Shopping Cart</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Customer Service</h4>
            <ul>
              <li><a href="#support">Support Center</a></li>
              <li><a href="#returns">Returns & Refunds</a></li>
              <li><a href="#shipping">Shipping Info</a></li>
              <li><a href="#faq">FAQ</a></li>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Our Partners</h4>
            <ul className="partner-list">
              <li>
                <span className="partner-icon">🏢</span>
                <div>
                  <strong>TechWorld</strong>
                  <small>Electronics & Components</small>
                </div>
              </li>
              <li>
                <span className="partner-icon">⚡</span>
                <div>
                  <strong>ElectroCom</strong>
                  <small>Consumer Electronics</small>
                </div>
              </li>
              <li>
                <span className="partner-icon">🔧</span>
                <div>
                  <strong>Gadget Central</strong>
                  <small>Smart Devices & Gadgets</small>
                </div>
              </li>
            </ul>
            <div className="partner-info">
              <small>All orders are fulfilled directly by our trusted distributor partners.</small>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>&copy; 2025 The Gadget Hub. All rights reserved.</p>
            <div className="footer-bottom-links">
              <Link to="/privacy">Privacy</Link>
              <Link to="/terms">Terms</Link>
              <Link to="/cookies">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 