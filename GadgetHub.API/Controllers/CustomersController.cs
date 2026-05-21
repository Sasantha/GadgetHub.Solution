using Microsoft.AspNetCore.Mvc;
using GadgetHub.API.Models;
using GadgetHub.API.Services;

namespace GadgetHub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CustomersController : ControllerBase
    {
        private readonly ICustomerService _customerService;

        public CustomersController(ICustomerService customerService)
        {
            _customerService = customerService;
        }

        // NEW: Customer Authentication Endpoints

        // POST: api/customers/login
        [HttpPost("login")]
        public async Task<ActionResult> Login([FromBody] CustomerLoginRequest request)
        {
            try
            {
                var customer = await _customerService.AuthenticateAsync(request.Email, request.Password);
                
                if (customer == null)
                {
                    return Unauthorized(new { success = false, message = "Invalid email or password" });
                }

                // Return customer data without password hash
                var customerResponse = new
                {
                    id = customer.Id,
                    firstName = customer.FirstName,
                    lastName = customer.LastName,
                    email = customer.Email,
                    phone = customer.Phone,
                    address = customer.Address,
                    createdAt = customer.CreatedAt
                };

                return Ok(new { 
                    success = true, 
                    data = customerResponse, 
                    message = "Login successful" 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // POST: api/customers/register
        [HttpPost("register")]
        public async Task<ActionResult> Register([FromBody] CustomerRegisterRequest request)
        {
            try
            {
                var customer = await _customerService.RegisterAsync(
                    request.FirstName,
                    request.LastName, 
                    request.Email,
                    request.Password,
                    request.Phone,
                    request.Address
                );

                // Return customer data without password hash
                var customerResponse = new
                {
                    id = customer.Id,
                    firstName = customer.FirstName,
                    lastName = customer.LastName,
                    email = customer.Email,
                    phone = customer.Phone,
                    address = customer.Address,
                    createdAt = customer.CreatedAt
                };

                return Ok(new { 
                    success = true, 
                    data = customerResponse, 
                    message = "Registration successful" 
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // Existing CRUD endpoints
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Customer>>> GetCustomers()
        {
            try
            {
                var customers = await _customerService.GetAllCustomersAsync();
                return Ok(customers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Customer>> GetCustomer(string id)
        {
            try
            {
                var customer = await _customerService.GetCustomerByIdAsync(id);
                
                if (customer == null)
                {
                    return NotFound(new { error = "Customer not found" });
                }

                return Ok(customer);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("email/{email}")]
        public async Task<ActionResult<Customer>> GetCustomerByEmail(string email)
        {
            try
            {
                var customer = await _customerService.GetCustomerByEmailAsync(email);
                
                if (customer == null)
                {
                    return NotFound(new { error = "Customer not found" });
                }

                return Ok(customer);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<Customer>> CreateCustomer(Customer customer)
        {
            try
            {
                var createdCustomer = await _customerService.CreateCustomerAsync(customer);
                return CreatedAtAction(nameof(GetCustomer), new { id = createdCustomer.Id }, createdCustomer);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCustomer(string id, Customer customer)
        {
            try
            {
                if (id != customer.Id)
                {
                    return BadRequest(new { error = "ID mismatch" });
                }

                await _customerService.UpdateCustomerAsync(customer);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCustomer(string id)
        {
            try
            {
                await _customerService.DeleteCustomerAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("exists/{email}")]
        public async Task<ActionResult<bool>> CustomerExists(string email)
        {
            try
            {
                var exists = await _customerService.CustomerExistsAsync(email);
                return Ok(new { exists });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }

    // Request DTOs for authentication
    public class CustomerLoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class CustomerRegisterRequest
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Address { get; set; }
    }
} 