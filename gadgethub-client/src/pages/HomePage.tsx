// HomePage - Landing page with API connectivity test
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ProductService } from '../services';
import { Product } from '../types';
import ProductCard from '../components/product/ProductCard';
import { API_CONFIG, getApiUrl } from '../config/api';


const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await ProductService.getProducts();
        if (response.success && response.data) {
          setProducts(response.data.slice(0, 3)); // Show first 3 products
        } else {
          setError(response.error || 'Failed to load products');
        }
      } catch (err) {
        setError('Error connecting to API');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);



  return (
    <div className="container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to The Gadget Hub</h1>
          <p>Your one-stop destination for the latest gadgets</p>
          <p className="hero-subtitle">
            We work with 3 distributors (TechWorld, ElectroCom, Gadget Central) 
            to find you the best prices and fastest delivery!
          </p>
          <Link to="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-products">
        <h2>Featured Products</h2>
        
        {loading && (
          <div className="featured-loading">
            <div className="products-grid">
              {Array.from({ length: 3 }).map((_, index) => (
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
        )}
        
        {error && (
          <div className="error">
            <p>❌ {error}</p>
            <p>Make sure the API is running at {API_CONFIG.ORIGIN}</p>
          </div>
        )}
        
        {!loading && !error && products.length > 0 && (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="no-products">
            <p>No products available. Try seeding the database:</p>
            <p><code>GET {getApiUrl('/test/seed-data')}</code></p>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="featured-products-footer">
            <Link to="/products" className="btn btn-primary">
              View All Products →
            </Link>
          </div>
        )}
      </section>

      {/* Business Process Info */}
      <section className="process-info">
        <h2>How The Gadget Hub Works</h2>
        <div className="process-steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Browse & Add to Cart</h3>
            <p>Find your favorite gadgets and add them to your cart</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Request Quotations</h3>
            <p>We request quotes from all 3 distributors automatically</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Compare & Order</h3>
            <p>We show you the best prices and place orders for you</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Track Delivery</h3>
            <p>Monitor your order status and estimated delivery</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 
