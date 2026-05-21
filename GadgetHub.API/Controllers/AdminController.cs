using Microsoft.AspNetCore.Mvc;
using GadgetHub.API.Models;
using GadgetHub.API.Services;

namespace GadgetHub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        // POST: api/admin/login
        [HttpPost("login")]
        public async Task<ActionResult> Login([FromBody] AdminLoginRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
                    return BadRequest("Username and password are required");

                var admin = await _adminService.AuthenticateAsync(request.Username, request.Password);
                if (admin == null)
                    return Unauthorized("Invalid username or password");

                // Create response without password hash
                var response = new
                {
                    admin = new
                    {
                        admin.Id,
                        admin.Username,
                        admin.Email,
                        admin.FirstName,
                        admin.LastName,
                        admin.Role,
                        admin.IsActive,
                        admin.LastLoginAt,
                        admin.CreatedAt,
                        admin.UpdatedAt
                    },
                    token = $"mock-token-{DateTime.UtcNow.Ticks}", // In production, use proper JWT
                    expiresAt = DateTime.UtcNow.AddHours(8)
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/admin/dashboard/stats
        [HttpGet("dashboard/stats")]
        public async Task<ActionResult> GetDashboardStats()
        {
            try
            {
                var stats = await _adminService.GetDashboardStatsAsync();
                return Ok(new { success = true, data = stats });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }

        // NEW - Enhanced Dashboard Stats
        [HttpGet("dashboard/enhanced")]
        public async Task<ActionResult> GetEnhancedDashboardStats()
        {
            try
            {
                var stats = await _adminService.GetEnhancedDashboardStatsAsync();
                return Ok(new { success = true, data = stats });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }

        // NEW - Order Status Breakdown
        [HttpGet("analytics/order-status")]
        public async Task<ActionResult> GetOrderStatusBreakdown()
        {
            try
            {
                var breakdown = await _adminService.GetOrderStatusBreakdownAsync();
                return Ok(new { success = true, data = breakdown });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }

        // NEW - Revenue by Distributor
        [HttpGet("analytics/revenue-by-distributor")]
        public async Task<ActionResult> GetRevenueByDistributor()
        {
            try
            {
                var revenue = await _adminService.GetRevenueByDistributorAsync();
                return Ok(new { success = true, data = revenue });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }

        // NEW - Customer Activity Report
        [HttpGet("reports/customer-activity")]
        public async Task<ActionResult> GetCustomerActivityReport([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var report = await _adminService.GetCustomerActivityReportAsync(startDate, endDate);
                return Ok(new { success = true, data = report });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }

        // NEW - Distributor Performance
        [HttpGet("analytics/distributor-performance")]
        public async Task<ActionResult> GetDistributorPerformance()
        {
            try
            {
                var performance = await _adminService.GetDistributorPerformanceAsync();
                return Ok(new { success = true, data = performance });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }

        // NEW - Quotation Monitoring
        [HttpGet("analytics/quotation-monitoring")]
        public async Task<ActionResult> GetQuotationMonitoring()
        {
            try
            {
                var monitoring = await _adminService.GetQuotationMonitoringAsync();
                return Ok(new { success = true, data = monitoring });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }

        // NEW - Order Summary Report
        [HttpGet("reports/order-summary")]
        public async Task<ActionResult> GetOrderSummaryReport([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null, [FromQuery] string? status = null)
        {
            try
            {
                var report = await _adminService.GetOrderSummaryReportAsync(startDate, endDate, status);
                return Ok(new { success = true, data = report });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }

        // NEW - Processing Times
        [HttpGet("analytics/processing-times")]
        public async Task<ActionResult> GetProcessingTimes()
        {
            try
            {
                var times = await _adminService.GetProcessingTimesAsync();
                return Ok(new { success = true, data = times });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }

        // NEW - Success Rates
        [HttpGet("analytics/success-rates")]
        public async Task<ActionResult> GetSuccessRates()
        {
            try
            {
                var rates = await _adminService.GetSuccessRatesAsync();
                return Ok(new { success = true, data = rates });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }

        // NEW - Export Orders CSV
        [HttpGet("export/orders")]
        public async Task<ActionResult> ExportOrders([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var csv = await _adminService.ExportOrdersAsync(startDate, endDate);
                var fileName = $"orders-export-{DateTime.UtcNow:yyyyMMdd-HHmmss}.csv";
                
                return File(System.Text.Encoding.UTF8.GetBytes(csv), "text/csv", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }

        // NEW - Export Customers CSV
        [HttpGet("export/customers")]
        public async Task<ActionResult> ExportCustomers()
        {
            try
            {
                var csv = await _adminService.ExportCustomersAsync();
                var fileName = $"customers-export-{DateTime.UtcNow:yyyyMMdd-HHmmss}.csv";
                
                return File(System.Text.Encoding.UTF8.GetBytes(csv), "text/csv", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }

        // NEW - Export Analytics CSV
        [HttpGet("export/analytics")]
        public async Task<ActionResult> ExportAnalytics()
        {
            try
            {
                var csv = await _adminService.ExportAnalyticsAsync();
                var fileName = $"analytics-export-{DateTime.UtcNow:yyyyMMdd-HHmmss}.csv";
                
                return File(System.Text.Encoding.UTF8.GetBytes(csv), "text/csv", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }

        // GET: api/admin/system/health
        [HttpGet("system/health")]
        public async Task<ActionResult> GetSystemHealth()
        {
            try
            {
                var health = await _adminService.GetSystemHealthAsync();
                return Ok(new { success = true, data = health });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }

        // GET: api/admin
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Admin>>> GetAllAdmins()
        {
            try
            {
                var admins = await _adminService.GetAllAdminsAsync();
                
                // Remove password hashes from response
                var safeAdmins = admins.Select(a => new
                {
                    a.Id,
                    a.Username,
                    a.Email,
                    a.FirstName,
                    a.LastName,
                    a.Role,
                    a.IsActive,
                    a.LastLoginAt,
                    a.CreatedAt,
                    a.UpdatedAt
                });

                return Ok(safeAdmins);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/admin/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Admin>> GetAdmin(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                    return BadRequest("Admin ID is required");

                var admin = await _adminService.GetAdminByIdAsync(id);
                if (admin == null)
                    return NotFound($"Admin with ID {id} not found");

                // Remove password hash from response
                var safeAdmin = new
                {
                    admin.Id,
                    admin.Username,
                    admin.Email,
                    admin.FirstName,
                    admin.LastName,
                    admin.Role,
                    admin.IsActive,
                    admin.LastLoginAt,
                    admin.CreatedAt,
                    admin.UpdatedAt
                };

                return Ok(safeAdmin);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST: api/admin
        [HttpPost]
        public async Task<ActionResult<Admin>> CreateAdmin([FromBody] CreateAdminRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Username) || 
                    string.IsNullOrWhiteSpace(request.Email) ||
                    string.IsNullOrWhiteSpace(request.Password) ||
                    string.IsNullOrWhiteSpace(request.FirstName) ||
                    string.IsNullOrWhiteSpace(request.LastName))
                    return BadRequest("All required fields must be provided");

                // Check if username already exists
                if (await _adminService.AdminExistsAsync(request.Username))
                    return Conflict("Username already exists");

                // Check if email already exists
                if (await _adminService.AdminEmailExistsAsync(request.Email))
                    return Conflict("Email already exists");

                var admin = new Admin
                {
                    Username = request.Username,
                    Email = request.Email,
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    Role = request.Role ?? "admin",
                    IsActive = request.IsActive ?? true
                };

                var createdAdmin = await _adminService.CreateAdminAsync(admin, request.Password);

                // Remove password hash from response
                var safeAdmin = new
                {
                    createdAdmin.Id,
                    createdAdmin.Username,
                    createdAdmin.Email,
                    createdAdmin.FirstName,
                    createdAdmin.LastName,
                    createdAdmin.Role,
                    createdAdmin.IsActive,
                    createdAdmin.LastLoginAt,
                    createdAdmin.CreatedAt,
                    createdAdmin.UpdatedAt
                };

                return CreatedAtAction(nameof(GetAdmin), new { id = createdAdmin.Id }, safeAdmin);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // PUT: api/admin/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateAdmin(string id, [FromBody] UpdateAdminRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                    return BadRequest("Admin ID is required");

                var admin = await _adminService.GetAdminByIdAsync(id);
                if (admin == null)
                    return NotFound($"Admin with ID {id} not found");

                // Update only provided fields
                if (!string.IsNullOrWhiteSpace(request.Username))
                {
                    // Check if new username already exists (excluding current admin)
                    var existingAdmin = await _adminService.GetAdminByUsernameAsync(request.Username);
                    if (existingAdmin != null && existingAdmin.Id != id)
                        return Conflict("Username already exists");
                    
                    admin.Username = request.Username;
                }

                if (!string.IsNullOrWhiteSpace(request.Email))
                {
                    // Check if new email already exists (excluding current admin)
                    var existingAdmin = await _adminService.GetAdminByEmailAsync(request.Email);
                    if (existingAdmin != null && existingAdmin.Id != id)
                        return Conflict("Email already exists");
                    
                    admin.Email = request.Email;
                }

                if (!string.IsNullOrWhiteSpace(request.FirstName))
                    admin.FirstName = request.FirstName;

                if (!string.IsNullOrWhiteSpace(request.LastName))
                    admin.LastName = request.LastName;

                if (!string.IsNullOrWhiteSpace(request.Role))
                    admin.Role = request.Role;

                if (request.IsActive.HasValue)
                    admin.IsActive = request.IsActive.Value;

                await _adminService.UpdateAdminAsync(admin);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // DELETE: api/admin/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteAdmin(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                    return BadRequest("Admin ID is required");

                var admin = await _adminService.GetAdminByIdAsync(id);
                if (admin == null)
                    return NotFound($"Admin with ID {id} not found");

                await _adminService.DeleteAdminAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST: api/admin/{id}/change-password
        [HttpPost("{id}/change-password")]
        public async Task<ActionResult> ChangePassword(string id, [FromBody] ChangePasswordRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                    return BadRequest("Admin ID is required");

                if (string.IsNullOrWhiteSpace(request.CurrentPassword) || 
                    string.IsNullOrWhiteSpace(request.NewPassword))
                    return BadRequest("Current password and new password are required");

                var success = await _adminService.ChangePasswordAsync(id, request.CurrentPassword, request.NewPassword);
                if (!success)
                    return BadRequest("Current password is incorrect");

                return Ok(new { message = "Password changed successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }

    // DTOs for admin operations
    public class AdminLoginRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class CreateAdminRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? Role { get; set; }
        public bool? IsActive { get; set; }
    }

    public class UpdateAdminRequest
    {
        public string? Username { get; set; }
        public string? Email { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Role { get; set; }
        public bool? IsActive { get; set; }
    }

    public class ChangePasswordRequest
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
} 