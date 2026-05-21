// Customer Service - Handles customer API operations and authentication
import { ApiService } from './api';
import type { 
  Customer, 
  CustomerLoginRequest, 
  CustomerRegisterRequest, 
  CustomerAuthResponse 
} from '../types';

class CustomerServiceClass {
  // NEW: Authentication methods
  async login(email: string, password: string): Promise<CustomerAuthResponse> {
    try {
      const loginRequest: CustomerLoginRequest = { email, password };
      const response = await ApiService.post<any>('/customers/login', loginRequest);
      
      if (response.success && response.data && response.data.data) {
        return {
          success: true,
          data: response.data.data as Customer,
          message: response.data.message || 'Login successful'
        };
      }
      
      return {
        success: false,
        message: response.error || response.data?.message || 'Login failed'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Login failed'
      };
    }
  }

  async register(registerData: CustomerRegisterRequest): Promise<CustomerAuthResponse> {
    try {
      const response = await ApiService.post<any>('/customers/register', registerData);
      
      if (response.success && response.data && response.data.data) {
        return {
          success: true,
          data: response.data.data as Customer,
          message: response.data.message || 'Registration successful'
        };
      }
      
      return {
        success: false,
        message: response.error || response.data?.message || 'Registration failed'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Registration failed'
      };
    }
  }

  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const response = await ApiService.get<{ exists: boolean }>(`/customers/exists/${encodeURIComponent(email)}`);
      return response.success ? response.data?.exists || false : false;
    } catch (error) {
      console.error('Failed to check email existence:', error);
      return false;
    }
  }

  // Existing CRUD methods
  async getCustomers(): Promise<Customer[]> {
    try {
      const response = await ApiService.get<Customer[]>('/customers');
      return response.success ? response.data || [] : [];
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      return [];
    }
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    try {
      const response = await ApiService.get<Customer>(`/customers/${id}`);
      return response.success ? response.data || null : null;
    } catch (error) {
      console.error('Failed to fetch customer:', error);
      return null;
    }
  }

  async getCustomerByEmail(email: string): Promise<Customer | null> {
    try {
      const response = await ApiService.get<Customer>(`/customers/email/${encodeURIComponent(email)}`);
      return response.success ? response.data || null : null;
    } catch (error) {
      console.error('Failed to fetch customer by email:', error);
      return null;
    }
  }

  async createCustomer(customer: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer | null> {
    try {
      const response = await ApiService.post<Customer>('/customers', customer);
      return response.success ? response.data || null : null;
    } catch (error) {
      console.error('Failed to create customer:', error);
      return null;
    }
  }

  async updateCustomer(id: string, customer: Partial<Customer>): Promise<boolean> {
    try {
      const response = await ApiService.put(`/customers/${id}`, { ...customer, id });
      return response.success;
    } catch (error) {
      console.error('Failed to update customer:', error);
      return false;
    }
  }

  async deleteCustomer(id: string): Promise<boolean> {
    try {
      const response = await ApiService.delete(`/customers/${id}`);
      return response.success;
    } catch (error) {
      console.error('Failed to delete customer:', error);
      return false;
    }
  }
}

export const CustomerService = new CustomerServiceClass(); 