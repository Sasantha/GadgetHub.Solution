// Admin Context - Manages admin authentication and state
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Admin } from '../types/admin';
import { getApiUrl } from '../config/api';

interface AdminAuthState {
  isAuthenticated: boolean;
  admin: Admin | null;
  token: string | null;
}

interface AdminContextType extends AdminAuthState {
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

interface AdminProviderProps {
  children: ReactNode;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AdminAuthState>({
    isAuthenticated: false,
    admin: null,
    token: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved auth state on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('adminAuth');
    if (savedAuth) {
      try {
        const parsedAuth = JSON.parse(savedAuth);
        // Check if token is still valid (basic check)
        if (parsedAuth.token && parsedAuth.admin) {
          setAuthState({
            isAuthenticated: true,
            admin: parsedAuth.admin,
            token: parsedAuth.token
          });
        }
      } catch (e) {
        localStorage.removeItem('adminAuth');
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Call real backend API
      const response = await fetch(getApiUrl('/admin/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.REACT_APP_API_KEY ? { 'X-API-Key': process.env.REACT_APP_API_KEY } : {}),
        },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const data = await response.json();
        
        const newAuthState = {
          isAuthenticated: true,
          admin: data.admin,
          token: data.token
        };

        setAuthState(newAuthState);
        localStorage.setItem('adminAuth', JSON.stringify(newAuthState));
        return true;
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Invalid username or password');
        return false;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please check your connection and try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      admin: null,
      token: null
    });
    localStorage.removeItem('adminAuth');
    setError(null);
  };

  const value: AdminContextType = {
    ...authState,
    login,
    logout,
    isLoading,
    error
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}; 
