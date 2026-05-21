// About Page - Information about The Gadget Hub
import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="container">
      <div className="about-page">
        <div className="about-hero">
          <h1>About The Gadget Hub</h1>
          <p className="about-hero-subtitle">
            Your trusted gateway to the latest gadgets from verified distributors worldwide
          </p>
        </div>

        <div className="about-content">
          <section className="about-section">
            <h2>🌟 Our Mission</h2>
            <p>
              At The Gadget Hub, we revolutionize the way you shop for gadgets by connecting you 
              directly with trusted distributors. Our unique quotation system ensures you always 
              get the best prices and fastest delivery times available in the market.
            </p>
          </section>

          <section className="about-section">
            <h2>🔄 How We Work</h2>
            <div className="process-explanation">
              <div className="process-step">
                <div className="step-icon">🛍️</div>
                <div className="step-content">
                  <h3>Browse & Select</h3>
                  <p>Browse our curated catalog of the latest gadgets and add items to your cart.</p>
                </div>
              </div>
              <div className="process-step">
                <div className="step-icon">📋</div>
                <div className="step-content">
                  <h3>Get Quotations</h3>
                  <p>We automatically request quotes from our three trusted distributor partners.</p>
                </div>
              </div>
              <div className="process-step">
                <div className="step-icon">📊</div>
                <div className="step-content">
                  <h3>Compare & Choose</h3>
                  <p>Review all quotes side-by-side and select the best option for your needs.</p>
                </div>
              </div>
              <div className="process-step">
                <div className="step-icon">🚚</div>
                <div className="step-content">
                  <h3>Direct Fulfillment</h3>
                  <p>Your order is fulfilled directly by the selected distributor with full tracking.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="about-section">
            <h2>🤝 Our Partners</h2>
            <div className="partners-grid">
              <div className="partner-card">
                <div className="partner-icon">🏢</div>
                <h3>TechWorld</h3>
                <p><strong>Specialization:</strong> Electronics & Components</p>
                <p>Leading supplier of cutting-edge electronics and computer components with fast global shipping.</p>
                <ul>
                  <li>✅ 15+ years in business</li>
                  <li>✅ Worldwide shipping</li>
                  <li>✅ Premium tech brands</li>
                </ul>
              </div>
              <div className="partner-card">
                <div className="partner-icon">⚡</div>
                <h3>ElectroCom</h3>
                <p><strong>Specialization:</strong> Consumer Electronics</p>
                <p>Your go-to source for the latest consumer electronics and smart home devices.</p>
                <ul>
                  <li>✅ Latest gadget releases</li>
                  <li>✅ Competitive pricing</li>
                  <li>✅ Express delivery options</li>
                </ul>
              </div>
              <div className="partner-card">
                <div className="partner-icon">🔧</div>
                <h3>Gadget Central</h3>
                <p><strong>Specialization:</strong> Smart Devices & Gadgets</p>
                <p>Specialists in innovative smart devices and emerging technology gadgets.</p>
                <ul>
                  <li>✅ Innovative products</li>
                  <li>✅ Quality assurance</li>
                  <li>✅ Technical support</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="about-section">
            <h2>💡 Why Choose Us?</h2>
            <div className="benefits-grid">
              <div className="benefit-item">
                <div className="benefit-icon">💰</div>
                <h4>Best Prices Guaranteed</h4>
                <p>Our quotation system ensures you always get competitive pricing from multiple sources.</p>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">⚡</div>
                <h4>Fast Delivery</h4>
                <p>Compare delivery times and choose the fastest option that meets your needs.</p>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">🔒</div>
                <h4>Trusted Partners</h4>
                <p>All our distributors are verified and have proven track records of reliability.</p>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">📞</div>
                <h4>Direct Support</h4>
                <p>Get support directly from the distributor handling your order for faster resolution.</p>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">📦</div>
                <h4>Order Tracking</h4>
                <p>Full transparency with real-time tracking from order placement to delivery.</p>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">🌍</div>
                <h4>Global Reach</h4>
                <p>Access to gadgets from distributors worldwide with international shipping options.</p>
              </div>
            </div>
          </section>

          <section className="about-section">
            <h2>📈 Our Story</h2>
            <div className="story-content">
              <p>
                The Gadget Hub was founded in 2024 with a simple vision: to make gadget shopping 
                more transparent, competitive, and efficient. We recognized that customers often 
                struggled to find the best deals and fastest shipping options when shopping for 
                electronics and gadgets.
              </p>
              <p>
                By partnering with established distributors and creating an automated quotation 
                system, we've eliminated the guesswork from gadget shopping. Our platform handles 
                the complex process of comparing prices, availability, and delivery times, so you 
                can focus on choosing the right gadgets for your needs.
              </p>
              <p>
                Today, we're proud to serve customers worldwide, connecting them with trusted 
                distributors and ensuring they get the best value for their money. Our commitment 
                to transparency, efficiency, and customer satisfaction drives everything we do.
              </p>
            </div>
          </section>

          <section className="about-cta">
            <h2>Ready to Experience the Difference?</h2>
            <p>Join thousands of satisfied customers who have discovered a better way to shop for gadgets.</p>
            <div className="cta-buttons">
              <a href="/products" className="btn btn-primary">
                🛍️ Start Shopping
              </a>
              <a href="/contact" className="btn btn-secondary">
                📞 Contact Us
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutPage; 