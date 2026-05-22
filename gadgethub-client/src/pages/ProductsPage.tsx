// Products Page - Product catalog and search
// EXACTLY matching your backend ProductsController endpoints
import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { ProductService } from '../services';
import { useCustomer } from '../contexts/CustomerContext';
import ProductList from '../components/product/ProductList';
import { API_CONFIG } from '../config/api';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { customer } = useCustomer();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    let filtered = [...products];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.brand?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(product =>
        product.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedCategory]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await ProductService.getProducts();
      if (!response || !response.success || !response.data) {
        throw new Error('Failed to load products');
      }
      
      const productsData = response.data;
      setProducts(productsData);
      setFilteredProducts(productsData);
      
      // Extract unique categories from products
      const uniqueCategories = Array.from(new Set(
        productsData
          .map(p => p.category)
          .filter(Boolean) as string[]
      ));
      setCategories(uniqueCategories);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
  };

  if (error) {
    return (
      <div className="page-container">
        <h1>📱 Our Products</h1>
        <div className="products-error">
          <p>❌ {error}</p>
          <button className="btn btn-primary" onClick={loadProducts}>
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="products-header">
        <div className="products-title">
          <h1>📱 Our Products</h1>
          {customer && (
            <div className="customer-welcome">
              Welcome, <strong>{customer.firstName}!</strong>
            </div>
          )}
        </div>
        
        <div className="products-stats">
          <span className="products-count">
            {isLoading ? 'Loading...' : `${filteredProducts.length} Products Available`}
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="products-filters">
        <div className="search-section">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="🔍 Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="filter-section">
          <div className="filter-group">
            <label htmlFor="category-filter">📂 Category:</label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <button className="btn btn-secondary clear-filters" onClick={clearFilters}>
            🗑️ Clear Filters
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      {(searchQuery || selectedCategory) && (
        <div className="active-filters">
          <h4>Active Filters:</h4>
          <div className="filter-tags">
            {searchQuery && (
              <span className="filter-tag">
                Search: "{searchQuery}"
                <button onClick={() => setSearchQuery('')}>×</button>
              </span>
            )}
            {selectedCategory && (
              <span className="filter-tag">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory('')}>×</button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="products-content">
        <ProductList 
          products={filteredProducts} 
          isLoading={isLoading} 
          error={error}
        />

        {/* API Connection Status */}
        <div className="api-status">
          <p>
            <span className="status-indicator success"></span>
            Connected to API: <code>{API_CONFIG.ORIGIN}</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage; 
