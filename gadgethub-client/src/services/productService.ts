// Product Service - Handles product catalog operations
// EXACTLY matching the backend ProductsController endpoints
import { ApiService } from './api';
import { Product } from '../types';

export class ProductService {
  private static readonly baseEndpoint = '/products';

  // GET /api/products - Get all products
  static async getProducts() {
    return ApiService.get<Product[]>(this.baseEndpoint);
  }

  // GET /api/products/{id} - Get product by ID
  static async getProductById(id: string) {
    return ApiService.get<Product>(`${this.baseEndpoint}/${id}`);
  }

  // GET /api/products/category/{category} - Get products by category
  static async getProductsByCategory(category: string) {
    return ApiService.get<Product[]>(`${this.baseEndpoint}/category/${category}`);
  }

  // GET /api/products/search?term={term} - Search products
  static async searchProducts(searchTerm: string) {
    return ApiService.get<Product[]>(`${this.baseEndpoint}/search?term=${encodeURIComponent(searchTerm)}`);
  }

  // GET /api/products/categories - Get all categories
  static async getCategories() {
    return ApiService.get<string[]>(`${this.baseEndpoint}/categories`);
  }

  // POST /api/products - Create product
  static async createProduct(product: Omit<Product, 'id' | 'createdAt'>) {
    return ApiService.post<Product>(this.baseEndpoint, product);
  }

  // PUT /api/products/{id} - Update product
  static async updateProduct(id: string, product: Omit<Product, 'id' | 'createdAt'>) {
    return ApiService.put<Product>(`${this.baseEndpoint}/${id}`, product);
  }

  // DELETE /api/products/{id} - Delete product
  static async deleteProduct(id: string) {
    return ApiService.delete<void>(`${this.baseEndpoint}/${id}`);
  }
} 