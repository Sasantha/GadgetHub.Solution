// Admin Service - Handles admin API operations
import { ApiService } from './api';
import type { 
  AdminStats, 
  AdminApiResponse, 
  EnhancedDashboardStats,
  CustomerActivityReport,
  DistributorPerformance,
  QuotationMonitoring,
  OrderSummaryReport,
  ProcessingTimesAnalytics,
  SuccessRatesAnalytics,
  SystemHealth
} from '../types/admin';

class AdminServiceClass {
  // Authentication methods (keep existing mock for demo)
  async login(username: string, password: string): Promise<AdminApiResponse<any>> {
    // For demo - in production this would call /api/admin/login
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if ((username === 'admin' && password === 'password123') ||
            (username === 'manager1' && password === 'password123') ||
            (username === 'support1' && password === 'password123')) {
          
          const roles = {
            'admin': 'super_admin',
            'manager1': 'manager', 
            'support1': 'admin'
          };
          
          resolve({
            success: true,
            data: {
              admin: {
                id: `${username}-id`,
                username,
                email: `${username}@gadgethub.com`,
                firstName: username === 'admin' ? 'System' : username === 'manager1' ? 'Michael' : 'Sarah',
                lastName: username === 'admin' ? 'Administrator' : username === 'manager1' ? 'Manager' : 'Support',
                role: roles[username as keyof typeof roles],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              token: `demo-token-${Date.now()}`,
              expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()
            }
          });
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  }

  // Dashboard methods - Enhanced for Phase 3
  async getDashboardStats(): Promise<AdminStats> {
    try {
      console.log('🔍 Fetching dashboard stats from API...');
      const response = await ApiService.get<any>('/admin/dashboard/stats');
      console.log('📊 API Response:', response);
      
      if (response.success && response.data) {
        console.log('✅ Dashboard stats received:', response.data);
        // The API returns { success: true, data: { ...stats } }
        // We need to extract the data object and cast it to AdminStats
        const stats = response.data as AdminStats;
        console.log('📈 Extracted stats:', stats);
        return stats;
      }
      
      console.warn('⚠️ API call failed or returned no data, returning zero values');
      // Return zero values if API fails instead of mock data
      return {
        totalOrders: 0,
        totalCustomers: 0,
        totalProducts: 0,
        totalDistributors: 0,
        pendingOrders: 0,
        todayOrders: 0,
        revenue: 0
      };
    } catch (error) {
      console.error('❌ Dashboard stats error:', error);
      console.warn('Failed to fetch dashboard stats, returning zero values');
      return {
        totalOrders: 0,
        totalCustomers: 0,
        totalProducts: 0,
        totalDistributors: 0,
        pendingOrders: 0,
        todayOrders: 0,
        revenue: 0
      };
    }
  }

  // NEW - Enhanced Dashboard Stats
  async getEnhancedDashboardStats(): Promise<EnhancedDashboardStats> {
    try {
      const response = await ApiService.get<EnhancedDashboardStats>('/admin/dashboard/enhanced');
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch enhanced stats');
    } catch (error) {
      console.warn('Failed to fetch enhanced dashboard stats, using mock data');
      // Return comprehensive mock data
      return {
        BasicStats: await this.getDashboardStats(),
        OrderStatusBreakdown: [
          { Status: 'pending', Count: 12, Percentage: 25.5 },
          { Status: 'confirmed', Count: 18, Percentage: 38.3 },
          { Status: 'shipped', Count: 15, Percentage: 31.9 },
          { Status: 'delivered', Count: 2, Percentage: 4.3 }
        ],
        RevenueByDistributor: [
          { DistributorId: 'd1', DistributorName: 'TechWorld', TotalRevenue: 15420.50, OrderCount: 45, AverageOrderValue: 342.68 },
          { DistributorId: 'd2', DistributorName: 'ElectroCom', TotalRevenue: 8950.25, OrderCount: 32, AverageOrderValue: 279.69 },
          { DistributorId: 'd3', DistributorName: 'Gadget Central', TotalRevenue: 6820.75, OrderCount: 28, AverageOrderValue: 243.60 }
        ],
        RecentOrders: [
          { Id: 'o1', CustomerId: 'c1', Status: 'delivered', TotalAmount: 1299.99, PlacedAt: new Date().toISOString(), DistributorId: 'd1' },
          { Id: 'o2', CustomerId: 'c2', Status: 'shipped', TotalAmount: 899.50, PlacedAt: new Date(Date.now() - 86400000).toISOString(), DistributorId: 'd2' }
        ],
        DailyOrdersTrend: Array.from({ length: 30 }, (_, i) => ({
          Date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
          OrderCount: Math.floor(Math.random() * 10) + 1,
          Revenue: Math.floor(Math.random() * 5000) + 500
        })).reverse(),
        SystemHealth: {
          status: 'healthy',
          database: 'connected',
          apiResponseTime: '125ms',
          lastUpdated: new Date().toISOString(),
          uptime: '99.9%',
          activeConnections: 42,
          memoryUsage: '68%',
          diskSpace: '45%'
        }
      };
    }
  }

  // NEW - Analytics Methods
  async getOrderStatusBreakdown() {
    try {
      const response = await ApiService.get('/admin/analytics/order-status');
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Failed to fetch order status breakdown:', error);
      return null;
    }
  }

  async getRevenueByDistributor() {
    try {
      const response = await ApiService.get('/admin/analytics/revenue-by-distributor');
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Failed to fetch revenue by distributor:', error);
      return null;
    }
  }

  async getCustomerActivityReport(startDate?: string, endDate?: string): Promise<CustomerActivityReport | null> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await ApiService.get<CustomerActivityReport>(`/admin/reports/customer-activity?${params}`);
      return response.success ? response.data || null : null;
    } catch (error) {
      console.error('Failed to fetch customer activity report:', error);
      return null;
    }
  }

  async getDistributorPerformance(): Promise<DistributorPerformance | null> {
    try {
      const response = await ApiService.get<DistributorPerformance>('/admin/analytics/distributor-performance');
      return response.success ? response.data || null : null;
    } catch (error) {
      console.error('Failed to fetch distributor performance:', error);
      return null;
    }
  }

  async getQuotationMonitoring(): Promise<QuotationMonitoring | null> {
    try {
      const response = await ApiService.get<QuotationMonitoring>('/admin/analytics/quotation-monitoring');
      return response.success ? response.data || null : null;
    } catch (error) {
      console.error('Failed to fetch quotation monitoring:', error);
      return null;
    }
  }

  async getOrderSummaryReport(startDate?: string, endDate?: string, status?: string): Promise<OrderSummaryReport | null> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (status) params.append('status', status);
      
      const response = await ApiService.get<OrderSummaryReport>(`/admin/reports/order-summary?${params}`);
      return response.success ? response.data || null : null;
    } catch (error) {
      console.error('Failed to fetch order summary report:', error);
      return null;
    }
  }

  async getProcessingTimes(): Promise<ProcessingTimesAnalytics | null> {
    try {
      const response = await ApiService.get<ProcessingTimesAnalytics>('/admin/analytics/processing-times');
      return response.success ? response.data || null : null;
    } catch (error) {
      console.error('Failed to fetch processing times:', error);
      return null;
    }
  }

  async getSuccessRates(): Promise<SuccessRatesAnalytics | null> {
    try {
      const response = await ApiService.get<SuccessRatesAnalytics>('/admin/analytics/success-rates');
      return response.success ? response.data || null : null;
    } catch (error) {
      console.error('Failed to fetch success rates:', error);
      return null;
    }
  }

  // NEW - Export Methods
  async exportOrders(startDate?: string, endDate?: string): Promise<void> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const url = `/admin/export/orders?${params}`;
      window.open(`${ApiService.getBaseUrl()}${url}`, '_blank');
    } catch (error) {
      console.error('Failed to export orders:', error);
    }
  }

  async exportCustomers(): Promise<void> {
    try {
      const url = `/admin/export/customers`;
      window.open(`${ApiService.getBaseUrl()}${url}`, '_blank');
    } catch (error) {
      console.error('Failed to export customers:', error);
    }
  }

  async exportAnalytics(): Promise<void> {
    try {
      const url = `/admin/export/analytics`;
      window.open(`${ApiService.getBaseUrl()}${url}`, '_blank');
    } catch (error) {
      console.error('Failed to export analytics:', error);
    }
  }

  async getSystemHealth(): Promise<SystemHealth | null> {
    try {
      const response = await ApiService.get<SystemHealth>('/admin/system/health');
      return response.success ? response.data || null : null;
    } catch (error) {
      console.warn('Failed to fetch system health, using mock data');
      return {
        status: 'healthy',
        database: 'connected',
        apiResponseTime: '125ms',
        lastUpdated: new Date().toISOString(),
        uptime: '99.9%',
        activeConnections: 42,
        memoryUsage: '68%',
        diskSpace: '45%'
      };
    }
  }

  // === QUOTATION MANAGEMENT METHODS ===

  // Get pending quotation requests
  async getPendingQuotationRequests() {
    try {
      const response = await ApiService.get<any[]>('/quotations/admin/pending');
      return response.success ? response.data || [] : [];
    } catch (error) {
      console.error('Failed to fetch pending quotation requests:', error);
      return [];
    }
  }

  // Get detailed quotation request information
  async getQuotationRequestDetails(requestId: string) {
    try {
      const response = await ApiService.get<any>(`/quotations/admin/request/${requestId}`);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Failed to fetch quotation request details:', error);
      return null;
    }
  }

  // Add distributor response
  async addDistributorResponse(responseData: any) {
    try {
      const response = await ApiService.post<any>('/quotations/admin/response', responseData);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Failed to add distributor response:', error);
      throw error;
    }
  }

  // Get quotation comparison
  async getQuotationComparison(requestId: string) {
    try {
      const response = await ApiService.get<any>(`/quotations/admin/comparison/${requestId}`);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Failed to fetch quotation comparison:', error);
      return null;
    }
  }

  // Approve quotation
  async approveQuotation(requestId: string, selectedResponseId: string, adminNotes?: string) {
    try {
      const approvalData = {
        selectedResponseId,
        adminNotes
      };
      const response = await ApiService.put<any>(`/quotations/admin/approve/${requestId}`, approvalData);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Failed to approve quotation:', error);
      throw error;
    }
  }

  // Get quotation statistics for dashboard
  async getQuotationStats() {
    try {
      const response = await ApiService.get<any>('/quotations/admin/stats');
      return response.success ? response.data : {};
    } catch (error) {
      console.error('Failed to fetch quotation stats:', error);
      return {};
    }
  }

  // Data Management methods (existing CRUD operations)
  async getAllOrders() {
    const response = await ApiService.get<any[]>('/orders');
    return response.success ? response.data || [] : [];
  }

  async getAllCustomers() {
    const response = await ApiService.get<any[]>('/customers');
    return response.success ? response.data || [] : [];
  }

  // NEW - Get Customer Orders
  async getCustomerOrders(customerId: string) {
    try {
      const response = await ApiService.get<any[]>(`/orders/customer/${customerId}`);
      return response.success ? response.data || [] : [];
    } catch (error) {
      console.error('Failed to fetch customer orders:', error);
      return [];
    }
  }

  async getAllProducts() {
    const response = await ApiService.get<any[]>('/products');
    return response.success ? response.data || [] : [];
  }

  async getAllDistributors() {
    const response = await ApiService.get<any[]>('/distributors');
    return response.success ? response.data || [] : [];
  }

  async updateOrderStatus(orderId: string, status: string) {
    try {
      const response = await ApiService.put(`/orders/${orderId}/status`, { status });
      return response.success;
    } catch (error) {
      console.error('Failed to update order status:', error);
      return false;
    }
  }

  async createCustomer(customer: any) {
    try {
      const response = await ApiService.post('/customers', customer);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Failed to create customer:', error);
      return null;
    }
  }

  async updateCustomer(customerId: string, customer: any) {
    try {
      const response = await ApiService.put(`/customers/${customerId}`, customer);
      return response.success;
    } catch (error) {
      console.error('Failed to update customer:', error);
      return false;
    }
  }

  async createProduct(product: any): Promise<any> {
    try {
      const response = await ApiService.post('/products', product);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Failed to create product:', error);
      return null;
    }
  }

  async updateProduct(productId: string, product: any): Promise<boolean> {
    try {
      console.log('🔄 Updating product:', { productId, product });
      const response = await ApiService.put(`/products/${productId}`, product);
      console.log('📡 Update response:', response);
      return response.success;
    } catch (error) {
      console.error('❌ Failed to update product:', error);
      return false;
    }
  }

  async deleteProduct(productId: string) {
    try {
      const response = await ApiService.delete(`/products/${productId}`);
      return response.success;
    } catch (error) {
      console.error('Failed to delete product:', error);
      return false;
    }
  }

  async getDistributorById(distributorId: string) {
    try {
      const response = await ApiService.get(`/distributors/${distributorId}`);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Failed to get distributor:', error);
      return null;
    }
  }

  async updateDistributor(distributorId: string, distributor: any) {
    try {
      const response = await ApiService.put(`/distributors/${distributorId}`, distributor);
      return response.success;
    } catch (error) {
      console.error('Failed to update distributor:', error);
      return false;
    }
  }

  async getRecentOrders() {
    try {
      const response = await ApiService.get('/orders');
      if (response.success && response.data && Array.isArray(response.data)) {
        // Sort by most recent and take first 10
        return response.data
          .sort((a: any, b: any) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime())
          .slice(0, 10);
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch recent orders:', error);
      return [];
    }
  }
}

export const AdminService = new AdminServiceClass();