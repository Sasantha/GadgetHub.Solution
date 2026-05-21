// Clean Quotation Service - Following Database Schema Exactly
import { ApiService } from './api';

export interface QuotationRequestDto {
  customerId: string;
  productId: string;
  quantity: number;
}

export interface QuotationRequest {
  id: string;
  customerId: string;
  productId: string;
  quantity: number;
  status: 'pending' | 'completed';
  requestedAt: string;
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
  estimatedDeliveryDays: number;
  status: 'unseen' | 'seen';
  respondedAt: string;
  distributor?: {
    id: string;
    name: string;
    type: string;
  };
}

export class QuotationService {
  
  // Step 1: Customer requests quotation (creates QuotationRequest)
  static async requestQuotation(request: QuotationRequestDto) {
    return ApiService.post<QuotationRequest>('/quotations/request', request);
  }

  // Step 2: Get quotation responses for a request (QuotationResponses)
  static async getQuotationResponses(requestId: string) {
    return ApiService.get<QuotationResponse[]>(`/quotations/request/${requestId}/responses`);
  }

  // Get quotation request details
  static async getQuotationRequest(requestId: string) {
    return ApiService.get<QuotationRequest>(`/quotations/request/${requestId}`);
  }

  // Get customer's quotation requests with responses
  static async getCustomerQuotations(customerId: string) {
    return ApiService.get<QuotationRequest[]>(`/quotations/customer/${customerId}`);
  }

  // Get quotation responses with distributor information
  static async getQuotationResponsesWithDistributors(requestId: string) {
    return ApiService.get<QuotationResponse[]>(`/quotations/request/${requestId}/responses`);
  }
} 