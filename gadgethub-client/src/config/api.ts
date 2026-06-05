// API Configuration - Matches your exact backend setup
const configuredBaseUrl =
  process.env.REACT_APP_API_BASE_URL ||
  process.env.REACT_APP_API_URL ||
  'http://localhost:5058/api';

const trimmedBaseUrl = configuredBaseUrl.replace(/\/+$/, '');
const normalizedBaseUrl = trimmedBaseUrl.endsWith('/api')
  ? trimmedBaseUrl
  : `${trimmedBaseUrl}/api`;

export const API_CONFIG = {
  BASE_URL: normalizedBaseUrl,
  ORIGIN: normalizedBaseUrl.endsWith('/api')
    ? normalizedBaseUrl.slice(0, -4)
    : normalizedBaseUrl,
  API_KEY: process.env.REACT_APP_API_KEY || '',
  DEFAULT_CUSTOMER_ID: 'c1', // Using the sample customer from your database
  ENDPOINTS: {
    // Matching your exact controller routes
    PRODUCTS: '/products',
    CART: '/cart',
    CUSTOMERS: '/customers', 
    DISTRIBUTORS: '/distributors',
    QUOTATIONS: '/quotations',
    ORDERS: '/orders',
    TEST: '/test'
  }
};

// Helper to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}; 
