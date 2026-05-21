import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useCustomer } from './CustomerContext';
import { getApiUrl } from '../config/api';

interface UnseenResponse {
  id: string;
  quotationRequestId: string;
  distributorId: string;
  productId: string;
  pricePerUnit: number;
  availableQuantity: number;
  estimatedDeliveryDays?: number;
  status: 'unseen' | 'seen';
  respondedAt: string;
  productName: string;
  distributorName: string;
}

interface NotificationContextType {
  unseenResponses: UnseenResponse[];
  unreadCount: number;
  isLoading: boolean;
  markResponseAsSeen: (responseId: string) => Promise<void>;
  markAllResponsesAsSeen: () => Promise<void>;
  clearNotifications: () => void;
  checkForUnseenResponses: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [unseenResponses, setUnseenResponses] = useState<UnseenResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { customer, isAuthenticated } = useCustomer();

  const checkForUnseenResponses = useCallback(async () => {
    if (!isAuthenticated || !customer) return;
    
    setIsLoading(true);

    try {
      console.log('Checking for unseen responses for customer:', customer.id);
      const response = await fetch(getApiUrl(`/quotations/customer/${customer.id}/unseen-responses`));
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Unseen responses data:', data);
        setUnseenResponses(data);
        
        // Show browser notification for new unseen responses
        if (data.length > 0 && 'Notification' in window && Notification.permission === 'granted') {
          data.forEach((response: UnseenResponse) => {
            new Notification('New Quotation Response', {
              body: `${response.productName} quotation is arrived`,
              icon: '/favicon.ico'
            });
          });
        }
      } else {
        console.error('Failed to fetch unseen responses:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error checking for unseen responses:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, customer]);

  // Check for unseen responses when customer is authenticated
  useEffect(() => {
    console.log('NotificationContext - Customer auth changed:', { isAuthenticated, customerId: customer?.id });
    if (isAuthenticated && customer) {
      console.log('NotificationContext - Customer authenticated, checking for unseen responses');
      checkForUnseenResponses();
    }
  }, [isAuthenticated, customer, checkForUnseenResponses]);

  // Set up periodic checking for new responses
  useEffect(() => {
    if (!isAuthenticated || !customer) return;

    const interval = setInterval(() => {
      checkForUnseenResponses();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, customer, checkForUnseenResponses]);

  const markResponseAsSeen = useCallback(async (responseId: string) => {
    try {
      console.log('Marking response as seen:', responseId);
      const response = await fetch(getApiUrl(`/quotations/response/${responseId}/mark-seen`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Mark seen response status:', response.status);
      
      if (response.ok) {
        console.log('Successfully marked response as seen');
        // Remove the response from unseen list
        setUnseenResponses(prev => prev.filter(r => r.id !== responseId));
      } else {
        console.error('Failed to mark response as seen:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error marking response as seen:', error);
    }
  }, []);

  const markAllResponsesAsSeen = useCallback(async () => {
    try {
      console.log('Marking all responses as seen');
      // Get current unseen responses and mark them as seen
      setUnseenResponses(prevResponses => {
        const currentResponses = [...prevResponses];
        console.log('Current unseen responses to mark:', currentResponses.length);
        
        // Mark all unseen responses as seen
        const promises = currentResponses.map(response => 
          fetch(getApiUrl(`/quotations/response/${response.id}/mark-seen`), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          })
        );
        
        Promise.all(promises).then(() => {
          console.log('Successfully marked all responses as seen');
        }).catch(error => {
          console.error('Error marking all responses as seen:', error);
        });
        
        return []; // Clear the list immediately
      });
    } catch (error) {
      console.error('Error marking all responses as seen:', error);
    }
  }, []);

  const clearNotifications = useCallback(() => {
    setUnseenResponses([]);
  }, []);

  const unreadCount = unseenResponses.length;

  const value: NotificationContextType = {
    unseenResponses,
    unreadCount,
    isLoading,
    markResponseAsSeen,
    markAllResponsesAsSeen,
    clearNotifications,
    checkForUnseenResponses
  };

  console.log('NotificationContext - Provider value:', { 
    unseenResponsesCount: unseenResponses.length, 
    unreadCount, 
    isLoading 
  });

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 
