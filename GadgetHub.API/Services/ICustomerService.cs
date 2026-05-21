using GadgetHub.API.Models;

namespace GadgetHub.API.Services
{
    public interface ICustomerService
    {
        // Existing CRUD methods
        Task<IEnumerable<Customer>> GetAllCustomersAsync();
        Task<Customer?> GetCustomerByIdAsync(string id);
        Task<Customer?> GetCustomerByEmailAsync(string email);
        Task<Customer> CreateCustomerAsync(Customer customer);
        Task UpdateCustomerAsync(Customer customer);
        Task DeleteCustomerAsync(string id);
        Task<bool> CustomerExistsAsync(string email);
        
        // NEW: Authentication methods
        Task<Customer?> AuthenticateAsync(string email, string password);
        Task<Customer> RegisterAsync(string firstName, string lastName, string email, string password, string? phone = null, string? address = null);
        Task<bool> ValidatePasswordAsync(string customerId, string password);
        Task UpdatePasswordAsync(string customerId, string newPassword);
    }
} 