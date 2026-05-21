// Contact Page - Contact form and company information
import React, { useState } from 'react';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    orderNumber: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        orderNumber: ''
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className="contact-page">
        <div className="contact-hero">
          <h1>Contact Us</h1>
          <p className="contact-hero-subtitle">
            We're here to help! Reach out to us for any questions, support, or feedback.
          </p>
        </div>

        <div className="contact-content">
          <div className="contact-grid">
            <div className="contact-info">
              <h2>Get in Touch</h2>
              <p>
                Have questions about our services, need help with an order, or want to learn more 
                about our distributor network? We're here to assist you every step of the way.
              </p>

              <div className="contact-methods">
                <div className="contact-method">
                  <div className="method-icon">📧</div>
                  <div className="method-content">
                    <h4>Email Support</h4>
                    <p>support@gadgethub.com</p>
                    <small>Response within 24 hours</small>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="method-icon">📞</div>
                  <div className="method-content">
                    <h4>Phone Support</h4>
                    <p>+1 (555) 123-4567</p>
                    <small>Mon-Fri 9AM-6PM EST</small>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="method-icon">💬</div>
                  <div className="method-content">
                    <h4>Live Chat</h4>
                    <p>Available on our website</p>
                    <small>Mon-Fri 9AM-9PM EST</small>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="method-icon">📍</div>
                  <div className="method-content">
                    <h4>Office Address</h4>
                    <p>123 Tech Hub Street<br />Silicon Valley, CA 94025</p>
                    <small>Visit by appointment only</small>
                  </div>
                </div>
              </div>

              <div className="distributor-support">
                <h3>Need Order Support?</h3>
                <p>For faster resolution of order-related issues, contact your distributor directly:</p>
                <div className="distributor-contacts">
                  <div className="distributor-contact">
                    <strong>🏢 TechWorld:</strong> support@techworld.com
                  </div>
                  <div className="distributor-contact">
                    <strong>⚡ ElectroCom:</strong> help@electrocom.com
                  </div>
                  <div className="distributor-contact">
                    <strong>🔧 Gadget Central:</strong> service@gadgetcentral.com
                  </div>
                </div>
              </div>
            </div>

            <div className="contact-form-section">
              <div className="contact-form-container">
                <h2>Send us a Message</h2>
                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">Full Name *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Email Address *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="subject">Subject *</label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select a subject</option>
                        <option value="general">General Inquiry</option>
                        <option value="order">Order Support</option>
                        <option value="technical">Technical Issue</option>
                        <option value="partnership">Partnership Opportunity</option>
                        <option value="feedback">Feedback & Suggestions</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="orderNumber">Order Number (if applicable)</label>
                      <input
                        type="text"
                        id="orderNumber"
                        name="orderNumber"
                        value={formData.orderNumber}
                        onChange={handleInputChange}
                        placeholder="Enter order number"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="message">Message *</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      placeholder="Tell us how we can help you..."
                    ></textarea>
                  </div>

                  {submitStatus === 'success' && (
                    <div className="form-success">
                      <p>✅ Thank you! Your message has been sent successfully. We'll get back to you within 24 hours.</p>
                    </div>
                  )}

                  {submitStatus === 'error' && (
                    <div className="form-error">
                      <p>❌ Sorry, there was an error sending your message. Please try again or contact us directly.</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-primary submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="loading-spinner-small"></span>
                        Sending Message...
                      </>
                    ) : (
                      '📧 Send Message'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="faq-section">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-grid">
              <div className="faq-item">
                <h4>How does the quotation system work?</h4>
                <p>When you request a quote, we automatically contact TechWorld, ElectroCom, and Gadget Central to get the best prices and delivery times for your selected items.</p>
              </div>
              <div className="faq-item">
                <h4>Who handles my order fulfillment?</h4>
                <p>Your order is fulfilled directly by the distributor you select. We facilitate the connection, but they handle shipping, tracking, and customer service for your order.</p>
              </div>
              <div className="faq-item">
                <h4>Can I return or exchange items?</h4>
                <p>Return and exchange policies are handled by the individual distributors. Check with your distributor's specific policy when placing your order.</p>
              </div>
              <div className="faq-item">
                <h4>How do I track my order?</h4>
                <p>You can track your order status in real-time through your account dashboard. You'll also receive tracking information directly from the distributor.</p>
              </div>
              <div className="faq-item">
                <h4>Is there a fee for using The Gadget Hub?</h4>
                <p>No! Our service is completely free for customers. We earn a small commission from our distributor partners when you make a purchase.</p>
              </div>
              <div className="faq-item">
                <h4>How do you ensure distributor quality?</h4>
                <p>All our distributor partners are thoroughly vetted and must maintain high standards for product quality, shipping times, and customer service.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage; 