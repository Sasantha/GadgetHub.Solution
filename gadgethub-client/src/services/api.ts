// Base API Service Configuration
// Uses the configured API base URL for local and deployed environments.
import { ApiResponse } from '../types';
import { API_CONFIG } from '../config/api';

export class ApiService {
  private static baseUrl = API_CONFIG.BASE_URL;

  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(API_CONFIG.API_KEY ? { 'X-API-Key': API_CONFIG.API_KEY } : {})
    };

    const config: RequestInit = {
      headers: { ...defaultHeaders, ...options.headers },
      ...options,
    };

    try {
      console.log(`API Request: ${options.method || 'GET'} ${url}`);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.text();
          if (errorData) {
            errorMessage = errorData;
          }
        } catch (e) {
          // Use default error message if can't read response
        }
        
        console.error(`API Error: ${errorMessage}`);
        return {
          success: false,
          error: errorMessage,
        };
      }

      // Check if response has content before parsing JSON
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');
      
      let data: T | undefined = undefined;
      
      // Only try to parse JSON if there's content
      if (contentType && contentType.includes('application/json') && contentLength !== '0') {
        const responseText = await response.text();
        if (responseText.trim()) {
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.warn('Failed to parse JSON response:', responseText);
            // For some endpoints, text response might be acceptable
            data = responseText as unknown as T;
          }
        }
      } else if (contentLength && contentLength !== '0') {
        // Non-JSON content
        data = await response.text() as unknown as T;
      }
      
      console.log(`API Success: ${options.method || 'GET'} ${url}`, data);
      return {
        success: true,
        data,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
      console.error(`API Network Error: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  static async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  static async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Test API connectivity
  static async testConnection(): Promise<ApiResponse<any>> {
    return this.get('/test/connection');
  }

  // Get base URL for direct file downloads/exports
  static getBaseUrl(): string {
    return this.baseUrl;
  }
} 
