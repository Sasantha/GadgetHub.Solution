// Main App Component with Routing
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Context Providers
import { AdminProvider } from './contexts/AdminContext';
import { CustomerProvider } from './contexts/CustomerContext';
import { CartProvider } from './contexts/CartContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import CustomerQuotations from './pages/CustomerQuotations';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

// Customer Authentication Pages
import CustomerLogin from './pages/CustomerLogin';
import CustomerRegister from './pages/CustomerRegister';

// Admin Components
import AdminLogin from './admin/pages/AdminLogin';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminOrders from './admin/pages/AdminOrders';
import AdminCustomers from './admin/pages/AdminCustomers';
import AdminProducts from './admin/pages/AdminProducts';
import AdminDistributors from './admin/pages/AdminDistributors';
import AdminQuotations from './admin/pages/AdminQuotations';
import AdminLayout from './admin/layout/AdminLayout';
import ProtectedAdminRoute from './admin/components/ProtectedAdminRoute';

// Styles
import './App.css';

function App() {
  return (
    <AdminProvider>
      <CustomerProvider>
        <CartProvider>
          <NotificationProvider>
            <Router>
            <Routes>
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/*" element={
                <ProtectedAdminRoute>
                  <AdminLayout>
                    <Routes>
                      <Route path="/" element={<AdminDashboard />} />
                      <Route path="/dashboard" element={<AdminDashboard />} />
                      <Route path="/orders" element={<AdminOrders />} />
                      <Route path="/customers" element={<AdminCustomers />} />
                      <Route path="/products" element={<AdminProducts />} />
                      <Route path="/distributors" element={<AdminDistributors />} />
                      <Route path="/quotations" element={<AdminQuotations />} />
                    </Routes>
                  </AdminLayout>
                </ProtectedAdminRoute>
              } />

              {/* Customer Authentication Routes */}
              <Route path="/login" element={<CustomerLogin />} />
              <Route path="/register" element={<CustomerRegister />} />

              {/* Public Routes */}
              <Route path="/*" element={
                <>
                  <Header />
                  <main className="main-content">
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/products" element={<ProductsPage />} />
                      <Route path="/product/:id" element={<ProductDetailsPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/orders" element={<OrdersPage />} />
                      <Route path="/quotations" element={<CustomerQuotations />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </main>
                  <Footer />
                </>
              } />
            </Routes>
          </Router>
          </NotificationProvider>
        </CartProvider>
      </CustomerProvider>
    </AdminProvider>
  );
}

export default App;
