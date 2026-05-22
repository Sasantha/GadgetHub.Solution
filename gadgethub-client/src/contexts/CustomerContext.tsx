// Customer Context - Manages global customer state and authentication
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Customer, CustomerRegisterRequest } from '../types';
import { CustomerService } from '../services/customerService';

interface CustomerContextType {
  // Authentication state
  isAuthenticated: boolean;
  customer: Customer | null;
  loading: boolean;
  
  // Authentication methods
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: CustomerRegisterRequest) => Promise<boolean>;
  logout: () => void;
  
  // Existing methods (for backward compatibility)
  customerId: string;
  createCustomer: (customerData: any) => Promise<Customer | null>;
  updateCustomer: (customerData: any) => Promise<boolean>;
  loadDefaultCustomer: () => Promise<void>;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

interface CustomerProviderProps {
  children: ReactNode;
}

export const CustomerProvider: React.FC<CustomerProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for stored authentication on mount
  useEffect(() => {
    checkStoredAuth();
  }, []);

  const checkStoredAuth = async () => {
    try {
      setLoading(true);
      const storedCustomer = localStorage.getItem('gadgethub_customer');
      
      if (storedCustomer) {
        const customerData = JSON.parse(storedCustomer);
        setCustomer(customerData);
        setIsAuthenticated(true);
      } else {
        // No stored authentication - user needs to login
        setCustomer(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Failed to check stored authentication:', error);
      // Clear authentication state on error
      setCustomer(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await CustomerService.login(email, password);
      
      if (response.success && response.data) {
        setCustomer(response.data);
        setIsAuthenticated(true);
        
        // Store in localStorage for persistence
        localStorage.setItem('gadgethub_customer', JSON.stringify(response.data));
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: CustomerRegisterRequest): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await CustomerService.register(data);
      
      if (response.success && response.data) {
        setCustomer(response.data);
        setIsAuthenticated(true);
        
        // Store in localStorage for persistence
        localStorage.setItem('gadgethub_customer', JSON.stringify(response.data));
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCustomer(null);
    setIsAuthenticated(false);
    localStorage.removeItem('gadgethub_customer');
    
    // Optionally reload default customer for demo purposes
    loadDefaultCustomer();
  };

  // Existing methods for backward compatibility
  const createCustomer = async (customerData: any): Promise<Customer | null> => {
    try {
      const newCustomer = await CustomerService.createCustomer(customerData);
      return newCustomer;
    } catch (error) {
      console.error('Failed to create customer:', error);
      return null;
    }
  };

  const updateCustomer = async (customerData: any): Promise<boolean> => {
    try {
      if (!customer) return false;
      
      const success = await CustomerService.updateCustomer(customer.id, customerData);
      
      if (success) {
        const updatedCustomer = { ...customer, ...customerData };
        setCustomer(updatedCustomer);
        
        if (isAuthenticated) {
          localStorage.setItem('gadgethub_customer', JSON.stringify(updatedCustomer));
        }
      }
      
      return success;
    } catch (error) {
      console.error('Failed to update customer:', error);
      return false;
    }
  };

  // Load default customer (for demo/backward compatibility - NOT authenticated)
  const loadDefaultCustomer = async (): Promise<void> => {
    try {
      const defaultCustomer = await CustomerService.getCustomerById('c1');
      if (defaultCustomer) {
        setCustomer(defaultCustomer);
        // DO NOT authenticate - user must login explicitly
        setIsAuthenticated(false);
        console.log('🎮 Demo mode: Default customer loaded (not authenticated)');
      }
    } catch (error) {
      console.error('Failed to load default customer:', error);
      setCustomer(null);
      setIsAuthenticated(false);
    }
  };

  const value: CustomerContextType = {
    // Authentication state
    isAuthenticated,
    customer,
    loading,
    
    // Authentication methods
    login,
    register,
    logout,
    
    // Backward compatibility
    customerId: customer?.id || 'c1',
    createCustomer,
    updateCustomer,
    loadDefaultCustomer
  };

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = (): CustomerContextType => {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
}; 