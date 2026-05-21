using GadgetHub.API.Models;
using GadgetHub.API.Repositories;
using BC = BCrypt.Net.BCrypt;

namespace GadgetHub.API.Services
{
    public class AdminService : IAdminService
    {
        private readonly IRepository<Admin> _adminRepository;
        private readonly IRepository<Order> _orderRepository;
        private readonly IRepository<Customer> _customerRepository;
        private readonly IRepository<Product> _productRepository;
        private readonly IRepository<Distributor> _distributorRepository;

        public AdminService(
            IRepository<Admin> adminRepository,
            IRepository<Order> orderRepository,
            IRepository<Customer> customerRepository,
            IRepository<Product> productRepository,
            IRepository<Distributor> distributorRepository)
        {
            _adminRepository = adminRepository;
            _orderRepository = orderRepository;
            _customerRepository = customerRepository;
            _productRepository = productRepository;
            _distributorRepository = distributorRepository;
        }

        // Authentication methods
        public async Task<Admin?> AuthenticateAsync(string username, string password)
        {
            var admin = await GetAdminByUsernameAsync(username);
            
            if (admin == null || !admin.IsActive)
                return null;

            if (!VerifyPassword(password, admin.PasswordHash))
                return null;

            // Update last login time
            await UpdateLastLoginAsync(admin.Id);
            
            return admin;
        }

        public async Task<Admin?> GetAdminByUsernameAsync(string username)
        {
            var admins = await _adminRepository.FindAsync(a => a.Username == username);
            return admins.FirstOrDefault();
        }

        public async Task<Admin?> GetAdminByEmailAsync(string email)
        {
            var admins = await _adminRepository.FindAsync(a => a.Email == email);
            return admins.FirstOrDefault();
        }

        public async Task UpdateLastLoginAsync(string adminId)
        {
            var admin = await _adminRepository.GetByIdAsync(adminId);
            if (admin != null)
            {
                admin.LastLoginAt = DateTime.UtcNow;
                admin.UpdatedAt = DateTime.UtcNow;
                await _adminRepository.UpdateAsync(admin);
            }
        }

        // CRUD operations
        public async Task<IEnumerable<Admin>> GetAllAdminsAsync()
        {
            return await _adminRepository.GetAllAsync();
        }

        public async Task<Admin?> GetAdminByIdAsync(string id)
        {
            return await _adminRepository.GetByIdAsync(id);
        }

        public async Task<Admin> CreateAdminAsync(Admin admin, string password)
        {
            admin.Id = Guid.NewGuid().ToString();
            admin.PasswordHash = HashPassword(password);
            admin.CreatedAt = DateTime.UtcNow;
            admin.UpdatedAt = DateTime.UtcNow;
            return await _adminRepository.AddAsync(admin);
        }

        public async Task<Admin> UpdateAdminAsync(Admin admin)
        {
            admin.UpdatedAt = DateTime.UtcNow;
            await _adminRepository.UpdateAsync(admin);
            return admin;
        }

        public async Task<bool> DeleteAdminAsync(string id)
        {
            try
            {
                await _adminRepository.DeleteAsync(id);
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> AdminExistsAsync(string username)
        {
            var admin = await GetAdminByUsernameAsync(username);
            return admin != null;
        }

        public async Task<bool> AdminEmailExistsAsync(string email)
        {
            var admin = await GetAdminByEmailAsync(email);
            return admin != null;
        }

        // Admin dashboard statistics - Enhanced for Phase 3
        public async Task<object> GetDashboardStatsAsync()
        {
            var totalOrders = (await _orderRepository.GetAllAsync()).Count();
            var totalCustomers = (await _customerRepository.GetAllAsync()).Count();
            var totalProducts = (await _productRepository.GetAllAsync()).Count();
            var totalDistributors = (await _distributorRepository.GetAllAsync()).Count();
            
            var orders = await _orderRepository.GetAllAsync();
            var pendingOrders = orders.Count(o => o.Status.ToLower() == "pending");
            var todayOrders = orders.Count(o => o.PlacedAt.Date == DateTime.UtcNow.Date);
            var revenue = orders.Where(o => o.Status.ToLower() == "delivered")
                                .Sum(o => o.TotalAmount);

            return new
            {
                totalOrders,
                totalCustomers,
                totalProducts,
                totalDistributors,
                pendingOrders,
                todayOrders,
                revenue
            };
        }

        // NEW - Enhanced Dashboard Stats with detailed analytics
        public async Task<object> GetEnhancedDashboardStatsAsync()
        {
            var orders = await _orderRepository.GetAllAsync();
            var customers = await _customerRepository.GetAllAsync();
            var distributors = await _distributorRepository.GetAllAsync();

            // Basic stats
            var basicStats = await GetDashboardStatsAsync();

            // Order status breakdown
            var orderStatusBreakdown = orders.GroupBy(o => o.Status.ToLower())
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToList();

            // Revenue by distributor
            var revenueByDistributor = orders
                .Where(o => o.Status.ToLower() == "delivered" && !string.IsNullOrEmpty(o.DistributorId))
                .GroupBy(o => o.DistributorId)
                .Select(g => new { 
                    DistributorId = g.Key, 
                    Revenue = g.Sum(o => o.TotalAmount),
                    OrderCount = g.Count()
                })
                .ToList();

            // Recent orders (last 7 days)
            var recentOrders = orders
                .Where(o => o.PlacedAt >= DateTime.UtcNow.AddDays(-7))
                .OrderByDescending(o => o.PlacedAt)
                .Take(10)
                .Select(o => new {
                    o.Id,
                    o.CustomerId,
                    o.Status,
                    o.TotalAmount,
                    o.PlacedAt,
                    o.DistributorId
                })
                .ToList();

            // Daily orders trend (last 30 days)
            var dailyOrdersTrend = Enumerable.Range(0, 30)
                .Select(i => DateTime.UtcNow.Date.AddDays(-i))
                .Select(date => new {
                    Date = date,
                    OrderCount = orders.Count(o => o.PlacedAt.Date == date),
                    Revenue = orders.Where(o => o.PlacedAt.Date == date && o.Status.ToLower() == "delivered")
                                   .Sum(o => o.TotalAmount)
                })
                .OrderBy(x => x.Date)
                .ToList();

            return new
            {
                BasicStats = basicStats,
                OrderStatusBreakdown = orderStatusBreakdown,
                RevenueByDistributor = revenueByDistributor,
                RecentOrders = recentOrders,
                DailyOrdersTrend = dailyOrdersTrend,
                SystemHealth = await GetSystemHealthAsync()
            };
        }

        // NEW - Order Status Breakdown
        public async Task<object> GetOrderStatusBreakdownAsync()
        {
            var orders = await _orderRepository.GetAllAsync();
            
            var breakdown = orders.GroupBy(o => o.Status.ToLower())
                .Select(g => new { 
                    Status = g.Key, 
                    Count = g.Count(),
                    Percentage = Math.Round((double)g.Count() / orders.Count() * 100, 2)
                })
                .ToList();

            return new { StatusBreakdown = breakdown, TotalOrders = orders.Count() };
        }

        // NEW - Revenue by Distributor
        public async Task<object> GetRevenueByDistributorAsync()
        {
            var orders = await _orderRepository.GetAllAsync();
            var distributors = await _distributorRepository.GetAllAsync();

            var revenueData = distributors.Select(d => new {
                DistributorId = d.Id,
                DistributorName = d.Name,
                TotalRevenue = orders
                    .Where(o => o.DistributorId == d.Id && o.Status.ToLower() == "delivered")
                    .Sum(o => o.TotalAmount),
                OrderCount = orders.Count(o => o.DistributorId == d.Id),
                AverageOrderValue = orders
                    .Where(o => o.DistributorId == d.Id && o.Status.ToLower() == "delivered")
                    .DefaultIfEmpty()
                    .Average(o => o?.TotalAmount ?? 0)
            }).ToList();

            return new { RevenueByDistributor = revenueData };
        }

        // NEW - Customer Activity Report
        public async Task<object> GetCustomerActivityReportAsync(DateTime? startDate = null, DateTime? endDate = null)
        {
            var start = startDate ?? DateTime.UtcNow.AddDays(-30);
            var end = endDate ?? DateTime.UtcNow;
            
            var orders = await _orderRepository.GetAllAsync();
            var customers = await _customerRepository.GetAllAsync();

            var customerActivity = customers.Select(c => new {
                CustomerId = c.Id,
                CustomerName = $"{c.FirstName} {c.LastName}", // Fixed: Combine FirstName and LastName
                Email = c.Email,
                TotalOrders = orders.Count(o => o.CustomerId == c.Id && o.PlacedAt >= start && o.PlacedAt <= end),
                TotalSpent = orders
                    .Where(o => o.CustomerId == c.Id && o.PlacedAt >= start && o.PlacedAt <= end && o.Status.ToLower() == "delivered")
                    .Sum(o => o.TotalAmount),
                LastOrderDate = orders
                    .Where(o => o.CustomerId == c.Id)
                    .OrderByDescending(o => o.PlacedAt)
                    .Select(o => o.PlacedAt)
                    .FirstOrDefault()
            }).OrderByDescending(c => c.TotalSpent).ToList();

            return new { 
                CustomerActivity = customerActivity,
                DateRange = new { StartDate = start, EndDate = end },
                Summary = new {
                    ActiveCustomers = customerActivity.Count(c => c.TotalOrders > 0),
                    TotalRevenue = customerActivity.Sum(c => c.TotalSpent),
                    AverageOrderValue = customerActivity.Where(c => c.TotalOrders > 0).DefaultIfEmpty()
                        .Average(c => c?.TotalSpent / Math.Max(c?.TotalOrders ?? 1, 1) ?? 0)
                }
            };
        }

        // NEW - Distributor Performance
        public async Task<object> GetDistributorPerformanceAsync()
        {
            var orders = await _orderRepository.GetAllAsync();
            var distributors = await _distributorRepository.GetAllAsync();

            var performance = distributors.Select(d => {
                var distributorOrders = orders.Where(o => o.DistributorId == d.Id).ToList();
                var deliveredOrders = distributorOrders.Where(o => o.Status.ToLower() == "delivered").ToList();
                
                return new {
                    DistributorId = d.Id,
                    DistributorName = d.Name,
                    DistributorType = d.Type,
                    TotalOrders = distributorOrders.Count(),
                    DeliveredOrders = deliveredOrders.Count(),
                    SuccessRate = distributorOrders.Count() > 0 ? 
                        Math.Round((double)deliveredOrders.Count() / distributorOrders.Count() * 100, 2) : 0,
                    TotalRevenue = deliveredOrders.Sum(o => o.TotalAmount),
                    AverageProcessingTime = deliveredOrders.Count() > 0 ?
                        deliveredOrders.Average(o => (o.EstimatedDelivery ?? o.PlacedAt).Subtract(o.PlacedAt).TotalDays) : 0, // Fixed: Use EstimatedDelivery instead of DeliveredAt
                    Rating = Math.Round(4.0 + (new Random().NextDouble() * 1.0), 1) // Mock rating
                };
            }).OrderByDescending(d => d.SuccessRate).ToList();

            return new { DistributorPerformance = performance };
        }

        // NEW - Quotation Monitoring
        public async Task<object> GetQuotationMonitoringAsync()
        {
            var orders = await _orderRepository.GetAllAsync();
            
            // Mock quotation data since we don't have separate quotation tracking
            var quotationStats = new {
                TotalQuotationRequests = orders.Count() * 3, // Assume 3 distributors per order
                SuccessfulQuotations = orders.Count(o => !string.IsNullOrEmpty(o.DistributorId)) * 3,
                FailedQuotations = orders.Count(o => string.IsNullOrEmpty(o.DistributorId)),
                AverageResponseTime = 2.5, // Mock average in hours
                QuotationSuccessRate = orders.Count() > 0 ? 
                    Math.Round((double)orders.Count(o => !string.IsNullOrEmpty(o.DistributorId)) / orders.Count() * 100, 2) : 0,
                RecentQuotations = orders.OrderByDescending(o => o.PlacedAt).Take(10)
                    .Select(o => new {
                        OrderId = o.Id,
                        CustomerId = o.CustomerId,
                        Status = "Completed",
                        ResponseTime = Math.Round(1.0 + (new Random().NextDouble() * 4.0), 1),
                        SelectedDistributor = o.DistributorId,
                        RequestedAt = o.PlacedAt
                    }).ToList()
            };

            return quotationStats;
        }

        // NEW - Order Summary Report
        public async Task<object> GetOrderSummaryReportAsync(DateTime? startDate = null, DateTime? endDate = null, string? status = null)
        {
            var start = startDate ?? DateTime.UtcNow.AddDays(-30);
            var end = endDate ?? DateTime.UtcNow;
            
            var orders = await _orderRepository.GetAllAsync();
            var filteredOrders = orders.Where(o => o.PlacedAt >= start && o.PlacedAt <= end);
            
            if (!string.IsNullOrEmpty(status))
            {
                filteredOrders = filteredOrders.Where(o => o.Status.ToLower() == status.ToLower());
            }

            var orderList = filteredOrders.ToList();

            return new {
                Orders = orderList.Select(o => new {
                    o.Id,
                    o.CustomerId,
                    o.ProductId,
                    o.Quantity,
                    o.TotalAmount,
                    o.Status,
                    o.PlacedAt,
                    o.EstimatedDelivery,
                    o.DistributorId
                }).ToList(),
                Summary = new {
                    TotalOrders = orderList.Count(),
                    TotalRevenue = orderList.Where(o => o.Status.ToLower() == "delivered").Sum(o => o.TotalAmount),
                    AverageOrderValue = orderList.Count() > 0 ? orderList.Average(o => o.TotalAmount) : 0,
                    StatusBreakdown = orderList.GroupBy(o => o.Status)
                        .Select(g => new { Status = g.Key, Count = g.Count() }).ToList()
                },
                DateRange = new { StartDate = start, EndDate = end }
            };
        }

        // NEW - Processing Times
        public async Task<object> GetProcessingTimesAsync()
        {
            var orders = await _orderRepository.GetAllAsync();
            var deliveredOrders = orders.Where(o => o.Status.ToLower() == "delivered" && o.EstimatedDelivery.HasValue).ToList(); // Fixed: Use EstimatedDelivery

            var processingTimes = deliveredOrders.Select(o => new {
                OrderId = o.Id,
                ProcessingTimeHours = (o.EstimatedDelivery!.Value - o.PlacedAt).TotalHours, // Fixed: Use EstimatedDelivery
                ProcessingTimeDays = (o.EstimatedDelivery!.Value - o.PlacedAt).TotalDays // Fixed: Use EstimatedDelivery
            }).ToList();

            return new {
                ProcessingTimes = processingTimes,
                Statistics = new {
                    AverageProcessingTimeHours = processingTimes.Count() > 0 ? processingTimes.Average(p => p.ProcessingTimeHours) : 0,
                    AverageProcessingTimeDays = processingTimes.Count() > 0 ? processingTimes.Average(p => p.ProcessingTimeDays) : 0,
                    FastestProcessingHours = processingTimes.Count() > 0 ? processingTimes.Min(p => p.ProcessingTimeHours) : 0,
                    SlowestProcessingHours = processingTimes.Count() > 0 ? processingTimes.Max(p => p.ProcessingTimeHours) : 0,
                    TotalProcessedOrders = processingTimes.Count()
                }
            };
        }

        // NEW - Success Rates
        public async Task<object> GetSuccessRatesAsync()
        {
            var orders = await _orderRepository.GetAllAsync();
            
            var totalOrders = orders.Count();
            var deliveredOrders = orders.Count(o => o.Status.ToLower() == "delivered");
            var cancelledOrders = orders.Count(o => o.Status.ToLower() == "cancelled");
            var pendingOrders = orders.Count(o => o.Status.ToLower() == "pending");

            return new {
                SuccessRates = new {
                    OverallSuccessRate = totalOrders > 0 ? Math.Round((double)deliveredOrders / totalOrders * 100, 2) : 0,
                    DeliveryRate = totalOrders > 0 ? Math.Round((double)deliveredOrders / totalOrders * 100, 2) : 0,
                    CancellationRate = totalOrders > 0 ? Math.Round((double)cancelledOrders / totalOrders * 100, 2) : 0,
                    PendingRate = totalOrders > 0 ? Math.Round((double)pendingOrders / totalOrders * 100, 2) : 0
                },
                OrderCounts = new {
                    TotalOrders = totalOrders,
                    DeliveredOrders = deliveredOrders,
                    CancelledOrders = cancelledOrders,
                    PendingOrders = pendingOrders
                }
            };
        }

        // NEW - Export Orders as CSV
        public async Task<string> ExportOrdersAsync(DateTime? startDate = null, DateTime? endDate = null)
        {
            var start = startDate ?? DateTime.UtcNow.AddDays(-30);
            var end = endDate ?? DateTime.UtcNow;
            
            var orders = await _orderRepository.GetAllAsync();
            var filteredOrders = orders.Where(o => o.PlacedAt >= start && o.PlacedAt <= end).ToList();

            var csv = "OrderId,CustomerId,ProductId,Quantity,TotalAmount,Status,PlacedAt,EstimatedDelivery,DistributorId\n"; // Fixed: Use EstimatedDelivery
            foreach (var order in filteredOrders)
            {
                csv += $"{order.Id},{order.CustomerId},{order.ProductId},{order.Quantity},{order.TotalAmount},{order.Status},{order.PlacedAt:yyyy-MM-dd HH:mm:ss},{order.EstimatedDelivery?.ToString("yyyy-MM-dd HH:mm:ss") ?? ""},{order.DistributorId ?? ""}\n"; // Fixed: Use EstimatedDelivery
            }

            return csv;
        }

        // NEW - Export Customers as CSV
        public async Task<string> ExportCustomersAsync()
        {
            var customers = await _customerRepository.GetAllAsync();

            var csv = "CustomerId,FirstName,LastName,Email,Phone,Address,CreatedAt\n"; // Fixed: Use FirstName, LastName
            foreach (var customer in customers)
            {
                csv += $"{customer.Id},{customer.FirstName},{customer.LastName},{customer.Email},{customer.Phone ?? ""},{customer.Address ?? ""},{customer.CreatedAt:yyyy-MM-dd HH:mm:ss}\n"; // Fixed: Use FirstName, LastName
            }

            return csv;
        }

        // NEW - Export Analytics as CSV
        public async Task<string> ExportAnalyticsAsync()
        {
            var stats = await GetEnhancedDashboardStatsAsync();
            
            var csv = "Metric,Value\n";
            csv += "Analytics Export Generated," + DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss") + "\n";
            csv += "Report Type,Enhanced Dashboard Analytics\n";
            
            // Add more analytics data as needed
            return csv;
        }

        public async Task<object> GetSystemHealthAsync()
        {
            // Simulate system health checks
            await Task.Delay(100); // Simulate some processing

            return new
            {
                status = "healthy",
                database = "connected",
                apiResponseTime = "125ms",
                lastUpdated = DateTime.UtcNow,
                uptime = "99.9%",
                activeConnections = 42,
                memoryUsage = "68%",
                diskSpace = "45%"
            };
        }

        // Password management
        public async Task<bool> ChangePasswordAsync(string adminId, string currentPassword, string newPassword)
        {
            var admin = await _adminRepository.GetByIdAsync(adminId);
            if (admin == null)
                return false;

            if (!VerifyPassword(currentPassword, admin.PasswordHash))
                return false;

            admin.PasswordHash = HashPassword(newPassword);
            admin.UpdatedAt = DateTime.UtcNow;
            await _adminRepository.UpdateAsync(admin);
            
            return true;
        }

        public string HashPassword(string password)
        {
            return BC.HashPassword(password);
        }

        public bool VerifyPassword(string password, string hash)
        {
            return BC.Verify(password, hash);
        }
    }
} 