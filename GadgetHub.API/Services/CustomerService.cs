using GadgetHub.API.Models;
using GadgetHub.API.Repositories;
using BC = BCrypt.Net.BCrypt;

namespace GadgetHub.API.Services
{
    public class CustomerService : ICustomerService
    {
        private readonly IRepository<Customer> _customerRepository;

        public CustomerService(IRepository<Customer> customerRepository)
        {
            _customerRepository = customerRepository;
        }

        // Existing CRUD methods
        public async Task<IEnumerable<Customer>> GetAllCustomersAsync()
        {
            return await _customerRepository.GetAllAsync();
        }

        public async Task<Customer?> GetCustomerByIdAsync(string id)
        {
            return await _customerRepository.GetByIdAsync(id);
        }

        public async Task<Customer?> GetCustomerByEmailAsync(string email)
        {
            var customers = await _customerRepository.FindAsync(c => c.Email == email);
            return customers.FirstOrDefault();
        }

        public async Task<Customer> CreateCustomerAsync(Customer customer)
        {
            customer.Id = Guid.NewGuid().ToString();
            customer.CreatedAt = DateTime.UtcNow;
            await _customerRepository.AddAsync(customer);
            return customer;
        }

        public async Task UpdateCustomerAsync(Customer customer)
        {
            await _customerRepository.UpdateAsync(customer);
        }

        public async Task DeleteCustomerAsync(string id)
        {
            await _customerRepository.DeleteAsync(id);
        }

        public async Task<bool> CustomerExistsAsync(string email)
        {
            var customers = await _customerRepository.FindAsync(c => c.Email == email);
            return customers.Any();
        }

        // NEW: Authentication methods
        public async Task<Customer?> AuthenticateAsync(string email, string password)
        {
            var customer = await GetCustomerByEmailAsync(email);
            
            if (customer == null || string.IsNullOrEmpty(customer.PasswordHash))
                return null;

            if (!BC.Verify(password, customer.PasswordHash))
                return null;

            return customer;
        }

        public async Task<Customer> RegisterAsync(string firstName, string lastName, string email, string password, string? phone = null, string? address = null)
        {
            // Check if customer already exists
            if (await CustomerExistsAsync(email))
            {
                throw new InvalidOperationException("Customer with this email already exists");
            }

            // Hash the password
            var passwordHash = BC.HashPassword(password);

            // Create new customer
            var customer = new Customer
            {
                Id = Guid.NewGuid().ToString(),
                FirstName = firstName,
                LastName = lastName,
                Email = email,
                Phone = phone,
                Address = address,
                PasswordHash = passwordHash,
                CreatedAt = DateTime.UtcNow
            };

            return await CreateCustomerAsync(customer);
        }

        public async Task<bool> ValidatePasswordAsync(string customerId, string password)
        {
            var customer = await GetCustomerByIdAsync(customerId);
            
            if (customer == null || string.IsNullOrEmpty(customer.PasswordHash))
                return false;

            return BC.Verify(password, customer.PasswordHash);
        }

        public async Task UpdatePasswordAsync(string customerId, string newPassword)
        {
            var customer = await GetCustomerByIdAsync(customerId);
            
            if (customer == null)
                throw new ArgumentException("Customer not found");

            customer.PasswordHash = BC.HashPassword(newPassword);
            await UpdateCustomerAsync(customer);
        }
    }
} 