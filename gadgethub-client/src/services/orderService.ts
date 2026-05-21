// Order Service - Handles quotations and orders
// EXACTLY matching the backend QuotationsController and OrdersController endpoints
import { ApiService } from './api';
import { QuotationRequest, QuotationResponse, Order, QuotationRequestDto, CreateOrderRequest } from '../types';

export class OrderService {
  private static readonly quotationsEndpoint = '/quotations';
  private static readonly ordersEndpoint = '/orders';

  // === QUOTATIONS API (from QuotationsController) ===
  
  // POST /api/quotations/request - Request quotes from all distributors
  static async requestQuotations(request: QuotationRequestDto) {
    return ApiService.post<QuotationRequest>(`${this.quotationsEndpoint}/request`, request);
  }

  // GET /api/quotations/request/{requestId}/responses - Get distributor responses
  static async getQuotationResponses(requestId: string) {
    return ApiService.get<QuotationResponse[]>(`${this.quotationsEndpoint}/request/${requestId}/responses`);
  }

  // GET /api/quotations/request/{requestId}/best - Get best quotation
  static async getBestQuotation(requestId: string) {
    return ApiService.get<QuotationResponse>(`${this.quotationsEndpoint}/request/${requestId}/best`);
  }

  // GET /api/quotations/customer/{customerId} - Get customer quotations
  static async getCustomerQuotations(customerId: string) {
    return ApiService.get<QuotationRequest[]>(`${this.quotationsEndpoint}/customer/${customerId}`);
  }

  // GET /api/quotations/request/{requestId} - Get quotation request details
  static async getQuotationRequest(requestId: string) {
    return ApiService.get<QuotationRequest>(`${this.quotationsEndpoint}/request/${requestId}`);
  }

  // === ORDERS API (from OrdersController) ===

  // POST /api/orders - Create order
  static async createOrder(request: CreateOrderRequest) {
    return ApiService.post<Order>(`${this.ordersEndpoint}`, request);
  }

  // GET /api/orders/{id} - Get order details
  static async getOrderById(id: string) {
    return ApiService.get<Order>(`${this.ordersEndpoint}/${id}`);
  }

  // GET /api/orders/customer/{customerId} - Get customer orders
  static async getCustomerOrders(customerId: string) {
    return ApiService.get<Order[]>(`${this.ordersEndpoint}/customer/${customerId}`);
  }

  // PUT /api/orders/{id}/status - Update order status
  static async updateOrderStatus(id: string, status: string) {
    return ApiService.put<Order>(`${this.ordersEndpoint}/${id}/status`, { status });
  }

  // GET /api/orders/{id}/track - Track order
  static async trackOrder(id: string) {
    return ApiService.get<Order>(`${this.ordersEndpoint}/${id}/track`);
  }
} 