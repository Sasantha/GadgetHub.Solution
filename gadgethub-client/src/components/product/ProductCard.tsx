// ProductCard Component - Product display card with add to cart
// EXACTLY matching your backend Product model and CartController endpoints
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { useCustomer } from '../../contexts/CustomerContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const { addToCart } = useCart();
  const { isAuthenticated, customer } = useCustomer();
  const navigate = useNavigate();

  // Handle add to cart - show popup if not authenticated
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated || !customer) {
      // Show popup for unauthenticated users
      alert('🔐 Login required to add products to cart');
      
      // Redirect to login with return path
      navigate('/login', { 
        state: { from: { pathname: `/product/${product.id}` } }
      });
      return;
    }

    try {
      setIsAddingToCart(true);
      await addToCart(product.id, 1);
      
      // Show success message
      alert(`✅ Successfully added "${product.name}" to cart!`);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('❌ Failed to add product to cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Handle view details - navigate to product page
  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="product-card">
      <div className="product-image">
        <img
          src={product.imageUrl || '/api/placeholder/400/300'}
          alt={product.name}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/api/placeholder/400/300';
          }}
        />
      </div>

      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        
        <div className="product-meta">
          {product.brand && (
            <span className="product-brand">🏷️ {product.brand}</span>
          )}
          {product.category && (
            <span className="product-category">📁 {product.category}</span>
          )}
        </div>

        <p className="product-description">
          {product.description 
            ? (product.description.length > 100 
                ? `${product.description.substring(0, 100)}...` 
                : product.description)
            : 'No description available'
          }
        </p>

        <div className="product-pricing-note">
          <span className="pricing-icon">💡</span>
          <div className="pricing-text-content">
            <span className="pricing-text">Price on Request</span>
            <small>We'll get you the best quotes from our distributors</small>
          </div>
        </div>
      </div>

      <div className="product-actions">
        <button
          type="button"
          className="btn btn-primary add-to-cart-btn"
          onClick={handleAddToCart}
          disabled={isAddingToCart}
        >
          {isAddingToCart ? (
            <>
              <span className="loading-spinner small"></span>
              Adding...
            </>
          ) : (
            '🛒 Add to Cart'
          )}
        </button>

        <button
          type="button"
          className="btn btn-secondary view-details-btn"
          onClick={handleViewDetails}
        >
          👁️ View Details
        </button>
      </div>
    </div>
  );
};

export default ProductCard; 