// Cart Service - Handles shopping cart operations
// EXACTLY matching the backend CartController endpoints
import { ApiService } from './api';
import { CartItem, AddToCartRequest, UpdateCartItemRequest } from '../types';

export class CartService {
  private static readonly baseEndpoint = '/cart';

  // GET /api/cart/{customerId} - Get cart items
  static async getCart(customerId: string) {
    return ApiService.get<CartItem[]>(`${this.baseEndpoint}/${customerId}`);
  }

  // POST /api/cart/{customerId}/add - Add item to cart
  static async addToCart(customerId: string, request: AddToCartRequest) {
    return ApiService.post<CartItem>(`${this.baseEndpoint}/${customerId}/add`, request);
  }

  // PUT /api/cart/{customerId}/update - Update cart item
  static async updateCartItem(customerId: string, request: UpdateCartItemRequest) {
    return ApiService.put<CartItem>(`${this.baseEndpoint}/${customerId}/update`, request);
  }

  // DELETE /api/cart/{customerId}/remove/{productId} - Remove item
  static async removeFromCart(customerId: string, productId: string) {
    return ApiService.delete<void>(`${this.baseEndpoint}/${customerId}/remove/${productId}`);
  }

  // DELETE /api/cart/{customerId}/clear - Clear cart
  static async clearCart(customerId: string) {
    return ApiService.delete<void>(`${this.baseEndpoint}/${customerId}/clear`);
  }

  // GET /api/cart/{customerId}/count - Get item count
  static async getCartCount(customerId: string) {
    return ApiService.get<number>(`${this.baseEndpoint}/${customerId}/count`);
  }

  // Helper method to calculate total amount
  static calculateCartTotal(cartItems: CartItem[]): number {
    return cartItems.reduce((total, item) => {
      if (item.product) {
        // Note: Backend doesn't store price in CartItem, would need to calculate from current product price
        return total + (item.quantity * 0); // Would need product price
      }
      return total;
    }, 0);
  }
} 