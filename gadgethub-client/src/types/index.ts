// Core Domain Types for The Gadget Hub Application
// EXACTLY matching the backend C# models and database schema

export interface Product {
  id: string;
  name: string;
  description?: string;
  category?: string;
  brand?: string;
  imageUrl?: string;
  createdAt: string; // DateTime from backend
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string; // Simple string, not complex object
  createdAt: string; // DateTime from backend
  // Note: passwordHash not included in frontend type for security
}

// NEW: Customer Authentication Types
export interface CustomerLoginRequest {
  email: string;
  password: string;
}

export interface CustomerRegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

export interface CustomerAuthResponse {
  success: boolean;
  data?: Customer;
  message: string;
}

export interface CustomerAuthState {
  isAuthenticated: boolean;
  customer: Customer | null;
  loading: boolean;
}

export interface Distributor {
  id: string;
  name: string;
  type: string; // TechWorld, ElectroCom, GadgetCentral
  contactInfo?: string;
  createdAt: string; // DateTime from backend
}

export interface CartItem {
  id: string;
  customerId: string;
  productId: string;
  quantity: number;
  addedAt: string; // DateTime from backend
  // Navigation properties (may be included by backend)
  customer?: Customer;
  product?: Product;
}

export interface QuotationRequest {
  id: string;
  customerId: string;
  productId: string; // Single product per request (backend structure)
  quantity: number;
  status: string; // pending, completed
  requestedAt: string; // DateTime from backend
  // Navigation properties
  customer?: Customer;
  product?: {
    id: string;
    name: string;
    brand: string;
    imageUrl: string;
  };
  quotationResponses?: QuotationResponse[];
}

export interface QuotationResponse {
  id: string;
  requestId: string;
  distributorId: string;
  productId: string;
  pricePerUnit: number;
  availableQuantity: number;
  estimatedDeliveryDays?: number;
  status: 'unseen' | 'seen'; // New field for notification tracking
  respondedAt: string; // DateTime from backend
  // Navigation properties
  request?: QuotationRequest;
  distributor?: {
    id: string;
    name: string;
    type: string;
  };
  product?: Product;
}

export interface Order {
  id: string;
  customerId: string;
  distributorId: string;
  productId: string; // Single product per order (backend structure)
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
  status: string; // pending, confirmed, shipped, delivered
  distributorOrderId?: string;
  estimatedDelivery?: string; // DateTime from backend
  placedAt: string; // DateTime from backend
  // Navigation properties
  customer?: Customer;
  distributor?: Distributor;
  product?: Product;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// UI State Types
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  id: string;
}

// Request DTOs (for API calls)
export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  productId: string;
  quantity: number;
}

export interface QuotationRequestDto {
  customerId: string;
  productId: string;
  quantity: number;
}

export interface CreateOrderRequest {
  customerId: string;
  distributorId: string;
  productId: string;
  quantity: number;
  pricePerUnit: number;
}

// Admin Types
export * from './admin'; 