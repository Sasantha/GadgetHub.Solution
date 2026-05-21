using GadgetHub.API.Models;

namespace GadgetHub.API.Services
{
    public interface IAdminService
    {
        // Authentication methods
        Task<Admin?> AuthenticateAsync(string username, string password);
        Task<Admin?> GetAdminByUsernameAsync(string username);
        Task<Admin?> GetAdminByEmailAsync(string email);
        Task UpdateLastLoginAsync(string adminId);
        
        // Admin CRUD operations
        Task<IEnumerable<Admin>> GetAllAdminsAsync();
        Task<Admin?> GetAdminByIdAsync(string id);
        Task<Admin> CreateAdminAsync(Admin admin, string password);
        Task<Admin> UpdateAdminAsync(Admin admin);
        Task<bool> DeleteAdminAsync(string id);
        
        // Admin utility methods
        Task<bool> AdminExistsAsync(string username);
        Task<bool> AdminEmailExistsAsync(string email);
        Task<bool> ChangePasswordAsync(string adminId, string currentPassword, string newPassword);
        
        // Dashboard & Analytics
        Task<object> GetDashboardStatsAsync();
        Task<object> GetSystemHealthAsync();
        Task<object> GetEnhancedDashboardStatsAsync(); // NEW - Enhanced stats with charts data
        
        // Reports & Analytics - NEW methods for Phase 3
        Task<object> GetOrderStatusBreakdownAsync();
        Task<object> GetRevenueByDistributorAsync();
        Task<object> GetCustomerActivityReportAsync(DateTime? startDate = null, DateTime? endDate = null);
        Task<object> GetDistributorPerformanceAsync();
        Task<object> GetQuotationMonitoringAsync();
        Task<object> GetOrderSummaryReportAsync(DateTime? startDate = null, DateTime? endDate = null, string? status = null);
        Task<object> GetProcessingTimesAsync();
        Task<object> GetSuccessRatesAsync();
        
        // Export functionality - NEW
        Task<string> ExportOrdersAsync(DateTime? startDate = null, DateTime? endDate = null);
        Task<string> ExportCustomersAsync();
        Task<string> ExportAnalyticsAsync();
    }
} 