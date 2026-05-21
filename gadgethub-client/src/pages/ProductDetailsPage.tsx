import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { ProductService } from '../services/productService';
import { useCart } from '../contexts/CartContext';
import { useCustomer } from '../contexts/CustomerContext';

const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  
  const { addToCart } = useCart();
  const { isAuthenticated, customer } = useCustomer();

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        setError('Product ID not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await ProductService.getProductById(id);
        if (response.success && response.data) {
          setProduct(response.data);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        console.error('Failed to load product:', err);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;

    if (!isAuthenticated || !customer) {
      alert('🔐 Login required to add products to cart');
      navigate('/login', { 
        state: { from: { pathname: `/product/${product.id}` } }
      });
      return;
    }

    try {
      setIsAddingToCart(true);
      await addToCart(product.id, quantity);
      alert(`✅ Successfully added ${quantity} x "${product.name}" to cart!`);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('❌ Failed to add product to cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="product-details-page loading">
        <div className="container">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <h2>Loading Product Details...</h2>
            <p>Please wait while we fetch the product information</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-details-page error">
        <div className="container">
          <div className="error-content">
            <div className="error-icon">❌</div>
            <h2>Product Not Found</h2>
            <p>{error || 'The requested product could not be found.'}</p>
            <div className="error-actions">
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/products')}
              >
                🔙 Back to Products
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => navigate('/')}
              >
                🏠 Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-details-page">
      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav className="breadcrumb-nav">
          <button 
            className="breadcrumb-link"
            onClick={() => navigate('/')}
          >
            🏠 Home
          </button>
          <span className="breadcrumb-separator">›</span>
          <button 
            className="breadcrumb-link"
            onClick={() => navigate('/products')}
          >
            📱 Products
          </button>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">{product.name}</span>
        </nav>

        {/* Product Details Content */}
        <div className="product-details-content">
          <div className="product-image-section">
            <div className="product-main-image">
              <img
                src={product.imageUrl || '/api/placeholder/600/600'}
                alt={product.name}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/api/placeholder/600/600';
                }}
              />
            </div>
          </div>

          <div className="product-info-section">
            <div className="product-header">
              <h1>{product.name}</h1>
              {product.brand && (
                <span className="product-brand-badge">🏷️ {product.brand}</span>
              )}
            </div>

            <div className="product-meta">
              {product.category && (
                <div className="meta-item">
                  <span className="meta-label">Category:</span>
                  <span className="meta-value">{product.category}</span>
                </div>
              )}
              <div className="meta-item">
                <span className="meta-label">Product ID:</span>
                <span className="meta-value">{product.id}</span>
              </div>
            </div>

            <div className="product-description">
              <h3>📋 Description</h3>
              <p>{product.description || 'No detailed description available for this product.'}</p>
            </div>

            <div className="product-pricing-info">
              <h3>💰 Pricing Information</h3>
              <div className="pricing-card">
                <div className="pricing-header">
                  <span className="pricing-icon">💡</span>
                  <strong>Best Price Guaranteed!</strong>
                </div>
                <p className="pricing-description">
                  We work with multiple distributors to get you the best possible price. 
                  Add to cart and we'll request quotes from our trusted partners:
                </p>
                <ul className="distributor-list">
                  <li>🏢 TechWorld</li>
                  <li>🏢 ElectroCom</li>
                  <li>🏢 Gadget Central</li>
                </ul>
              </div>
            </div>

            <div className="product-actions">
              {isAuthenticated && customer ? (
                <div className="authenticated-actions">
                  <div className="quantity-section">
                    <label htmlFor="quantity">Quantity:</label>
                    <div className="quantity-controls">
                      <button 
                        type="button"
                        className="quantity-btn"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        -
                      </button>
                      <span className="quantity-display">{quantity}</span>
                      <button 
                        type="button"
                        className="quantity-btn"
                        onClick={() => setQuantity(Math.min(99, quantity + 1))}
                        disabled={quantity >= 99}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary add-to-cart-btn large"
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                  >
                    {isAddingToCart ? (
                      <>
                        <span className="loading-spinner small"></span>
                        Adding to Cart...
                      </>
                    ) : (
                      `🛒 Add ${quantity} to Cart`
                    )}
                  </button>

                  <div className="action-buttons">
                    <button 
                      className="btn btn-secondary"
                      onClick={() => navigate('/products')}
                    >
                      🔙 Back to Products
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => navigate('/cart')}
                    >
                      🛒 View Cart
                    </button>
                  </div>
                </div>
              ) : (
                <div className="login-required-section">
                  <div className="login-prompt">
                    <div className="prompt-icon">🔐</div>
                    <h3>Login Required</h3>
                    <p>Please login to add items to your cart and request quotes from our distributors.</p>
                    <div className="auth-buttons">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => navigate('/login', { 
                          state: { from: { pathname: `/product/${product.id}` } }
                        })}
                      >
                        🔐 Login
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate('/register')}
                      >
                        ✨ Register
                      </button>
                    </div>
                  </div>
                  
                  <div className="navigation-buttons">
                    <button 
                      className="btn btn-secondary"
                      onClick={() => navigate('/products')}
                    >
                      🔙 Back to Products
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage; 