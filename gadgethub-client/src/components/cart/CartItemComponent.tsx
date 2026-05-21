// CartItemComponent - Individual cart item display
// EXACTLY matching your backend CartItem model structure
import React, { useState } from 'react';
import { CartItem } from '../../types';
import { useCart } from '../../contexts/CartContext';

interface CartItemComponentProps {
  cartItem: CartItem;
  onQuantityChange?: (productId: string, newQuantity: number) => void;
  onRemove?: (productId: string) => void;
}

const CartItemComponent: React.FC<CartItemComponentProps> = ({
  cartItem,
  onQuantityChange,
  onRemove
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const { updateCartItem, removeFromCart } = useCart();

  // Handle quantity change - using your exact CartController PUT /api/cart/{customerId}/update
  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > 99) return;
    
    try {
      setIsUpdating(true);
      
      if (onQuantityChange) {
        onQuantityChange(cartItem.productId, newQuantity);
      } else {
        await updateCartItem(cartItem.productId, newQuantity);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle remove item - using your exact CartController DELETE /api/cart/{customerId}/remove/{productId}
  const handleRemove = async () => {
    try {
      setIsRemoving(true);
      
      if (onRemove) {
        onRemove(cartItem.productId);
      } else {
        await removeFromCart(cartItem.productId);
      }
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // Simple placeholder fallback - no external URLs
  const getFallbackImage = () => {
    return '/api/placeholder/400/300';
  };

  // Get the best available image URL
  const getImageUrl = () => {
    // Priority: actual product imageUrl > fallback placeholder
    if (!imageError && cartItem.product?.imageUrl) {
      return cartItem.product.imageUrl;
    }
    return getFallbackImage();
  };

  // Format the addedAt date from your backend
  const formatAddedDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Recently added';
    }
  };

  return (
    <div className="cart-item-component">
      {/* Product Image */}
      <div className={`cart-item-image ${imageError ? 'error' : ''}`}>
        <img
          src={getImageUrl()}
          alt={cartItem.product?.name || 'Product'}
          onError={handleImageError}
          loading="lazy"
        />
      </div>

      {/* Product Details */}
      <div className="cart-item-details">
        <div className="cart-item-header">
          <h3 className="cart-item-name">
            {cartItem.product?.name || 'Product'}
          </h3>
          
          <div className="cart-item-meta">
            {cartItem.product?.category && (
              <span className="category">{cartItem.product.category}</span>
            )}
            {cartItem.product?.brand && (
              <span className="brand">{cartItem.product.brand}</span>
            )}
          </div>
        </div>

        {cartItem.product?.description && (
          <p className="cart-item-description">
            {cartItem.product.description}
          </p>
        )}

        <div className="cart-item-info">
          <small className="cart-item-date">
            Added: {formatAddedDate(cartItem.addedAt)}
          </small>
          <small className="cart-item-id">
            ID: {cartItem.id}
          </small>
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="cart-item-controls">
        <div className="quantity-section">
          <label className="quantity-label">Qty:</label>
          <div className="quantity-controls">
            <button
              type="button"
              className="quantity-btn"
              onClick={() => handleQuantityChange(cartItem.quantity - 1)}
              disabled={cartItem.quantity <= 1 || isUpdating}
            >
              -
            </button>
            
            <span className="quantity-display">
              {cartItem.quantity}
            </span>
            
            <button
              type="button"
              className="quantity-btn"
              onClick={() => handleQuantityChange(cartItem.quantity + 1)}
              disabled={cartItem.quantity >= 99 || isUpdating}
            >
              +
            </button>
          </div>
        </div>

        {/* Price placeholder - backend doesn't store price in CartItem */}
        <div className="price-section">
          <p className="price-note">
            💰 Price will be shown after getting quotes from distributors
          </p>
        </div>

        {/* Remove Button */}
        <div className="remove-section">
          <button
            type="button"
            className="remove-btn"
            onClick={handleRemove}
            disabled={isRemoving}
          >
            {isRemoving ? (
              <>
                <span className="loading-spinner-small"></span>
                Removing...
              </>
            ) : (
              '🗑️ Remove'
            )}
          </button>
        </div>
      </div>

      {/* Loading overlay for updates */}
      {isUpdating && (
        <div className="cart-item-loading-overlay">
          <span className="loading-spinner"></span>
        </div>
      )}
    </div>
  );
};

export default CartItemComponent; 