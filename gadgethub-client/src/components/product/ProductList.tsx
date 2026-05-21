// ProductList Component - Display grid of products
// EXACTLY matching your backend Product model
import React from 'react';
import { Product } from '../../types';
import ProductCard from './ProductCard';
import { API_CONFIG } from '../../config/api';

interface ProductListProps {
  products: Product[];
  isLoading?: boolean;
  error?: string | null;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  isLoading = false,
  error = null,
}) => {

  // Loading state
  if (isLoading) {
    return (
      <div className="product-list-loading">
        <div className="loading-grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="product-card-skeleton">
              <div className="skeleton-image"></div>
              <div className="skeleton-content">
                <div className="skeleton-title"></div>
                <div className="skeleton-description"></div>
                <div className="skeleton-meta"></div>
                <div className="skeleton-button"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="product-list-error">
        <div className="error-content">
          <h3>⚠️ Error Loading Products</h3>
          <p>{error}</p>
          <div className="error-suggestions">
            <p>Please check:</p>
            <ul>
              <li>API is running at <code>{API_CONFIG.ORIGIN}</code></li>
              <li>Database connection is working</li>
              <li>Sample data is seeded</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!products || products.length === 0) {
    return (
      <div className="product-list-empty">
        <div className="empty-content">
          <h3>📦 No products found</h3>
          <p>Try adjusting your search criteria or browse all categories.</p>
        </div>
      </div>
    );
  }

  // Products grid
  return (
    <div className="product-list">
      <div className="products-grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
      
      <div className="product-list-footer">
        <p className="results-count">
          Showing {products.length} product{products.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
};

export default ProductList; 
