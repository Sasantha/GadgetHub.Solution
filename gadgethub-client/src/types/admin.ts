// Admin Types - Matching the backend Admin model exactly
export interface Admin {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'super_admin' | 'manager';
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface AdminLoginResponse {
  admin: Admin;
  token: string;
  expiresAt: string;
}

export interface AdminStats {
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  totalDistributors: number;
  pendingOrders: number;
  todayOrders: number;
  revenue: number;
}

// NEW - Enhanced Dashboard Stats
export interface EnhancedDashboardStats {
  BasicStats: AdminStats;
  OrderStatusBreakdown: OrderStatusItem[];
  RevenueByDistributor: RevenueByDistributorItem[];
  RecentOrders: RecentOrderItem[];
  DailyOrdersTrend: DailyTrendItem[];
  SystemHealth: SystemHealth;
}

export interface OrderStatusItem {
  Status: string;
  Count: number;
  Percentage?: number;
}

export interface RevenueByDistributorItem {
  DistributorId: string;
  DistributorName: string;
  TotalRevenue: number;
  OrderCount: number;
  AverageOrderValue: number;
}

export interface RecentOrderItem {
  Id: string;
  CustomerId: string;
  Status: string;
  TotalAmount: number;
  PlacedAt: string;
  DistributorId?: string;
}

export interface DailyTrendItem {
  Date: string;
  OrderCount: number;
  Revenue: number;
}

export interface SystemHealth {
  status: string;
  database: string;
  apiResponseTime: string;
  lastUpdated: string;
  uptime: string;
  activeConnections: number;
  memoryUsage: string;
  diskSpace: string;
}

// NEW - Customer Activity Report
export interface CustomerActivityReport {
  CustomerActivity: CustomerActivityItem[];
  DateRange: { StartDate: string; EndDate: string };
  Summary: {
    ActiveCustomers: number;
    TotalRevenue: number;
    AverageOrderValue: number;
  };
}

export interface CustomerActivityItem {
  CustomerId: string;
  CustomerName: string;
  Email: string;
  TotalOrders: number;
  TotalSpent: number;
  LastOrderDate?: string;
}

// NEW - Distributor Performance
export interface DistributorPerformance {
  DistributorPerformance: DistributorPerformanceItem[];
}

export interface DistributorPerformanceItem {
  DistributorId: string;
  DistributorName: string;
  DistributorType: string;
  TotalOrders: number;
  DeliveredOrders: number;
  SuccessRate: number;
  TotalRevenue: number;
  AverageProcessingTime: number;
  Rating: number;
}

// NEW - Quotation Monitoring
export interface QuotationMonitoring {
  TotalQuotationRequests: number;
  SuccessfulQuotations: number;
  FailedQuotations: number;
  AverageResponseTime: number;
  QuotationSuccessRate: number;
  RecentQuotations: RecentQuotationItem[];
}

export interface RecentQuotationItem {
  OrderId: string;
  CustomerId: string;
  Status: string;
  ResponseTime: number;
  SelectedDistributor?: string;
  RequestedAt: string;
}

// NEW - Order Summary Report
export interface OrderSummaryReport {
  Orders: OrderSummaryItem[];
  Summary: {
    TotalOrders: number;
    TotalRevenue: number;
    AverageOrderValue: number;
    StatusBreakdown: OrderStatusItem[];
  };
  DateRange: { StartDate: string; EndDate: string };
}

export interface OrderSummaryItem {
  Id: string;
  CustomerId: string;
  ProductId: string;
  Quantity: number;
  TotalAmount: number;
  Status: string;
  PlacedAt: string;
  EstimatedDelivery?: string;
  DistributorId?: string;
}

// NEW - Processing Times
export interface ProcessingTimesAnalytics {
  ProcessingTimes: ProcessingTimeItem[];
  Statistics: {
    AverageProcessingTimeHours: number;
    AverageProcessingTimeDays: number;
    FastestProcessingHours: number;
    SlowestProcessingHours: number;
    TotalProcessedOrders: number;
  };
}

export interface ProcessingTimeItem {
  OrderId: string;
  ProcessingTimeHours: number;
  ProcessingTimeDays: number;
}

// NEW - Success Rates
export interface SuccessRatesAnalytics {
  SuccessRates: {
    OverallSuccessRate: number;
    DeliveryRate: number;
    CancellationRate: number;
    PendingRate: number;
  };
  OrderCounts: {
    TotalOrders: number;
    DeliveredOrders: number;
    CancelledOrders: number;
    PendingOrders: number;
  };
}

// NEW - Chart Data Types
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface LineChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
  }[];
}

export interface AdminAuthState {
  isAuthenticated: boolean;
  admin: Admin | null;
  token: string | null;
}

// API Response for admin operations
export interface AdminApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
} 