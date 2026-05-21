using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GadgetHub.API.Data;
using GadgetHub.API.Models;
using GadgetHub.API.Services;

namespace GadgetHub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        private readonly GadgetHubDbContext _context;
        private readonly IProductService _productService;
        private readonly ICustomerService _customerService;
        private readonly IDistributorService _distributorService;

        public TestController(
            GadgetHubDbContext context, 
            IProductService productService,
            ICustomerService customerService,
            IDistributorService distributorService)
        {
            _context = context;
            _productService = productService;
            _customerService = customerService;
            _distributorService = distributorService;
        }

        [HttpGet("connection")]
        public async Task<IActionResult> TestConnection()
        {
            try
            {
                // Test database connection
                var canConnect = await _context.Database.CanConnectAsync();
                if (!canConnect)
                {
                    return StatusCode(500, "Cannot connect to database");
                }

                // Test if tables exist
                var productCount = await _context.Products.CountAsync();
                var customerCount = await _context.Customers.CountAsync();
                var distributorCount = await _context.Distributors.CountAsync();

                return Ok(new
                {
                    Message = "Database connection successful!",
                    ProductCount = productCount,
                    CustomerCount = customerCount,
                    DistributorCount = distributorCount,
                    Tables = new[] { "Products", "Customers", "Distributors", "CartItems", "QuotationRequests", "QuotationResponses", "Orders" }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Database error: {ex.Message}");
            }
        }

        [HttpGet("seed-data")]
        public async Task<IActionResult> SeedTestData()
        {
            try
            {
                var seededItems = new List<string>();

                // Always ensure distributors exist (critical for quotation system)
                if (!await _context.Distributors.AnyAsync())
                {
                    var distributors = new List<Distributor>
                    {
                        new Distributor { Id = "d1", Name = "TechWorld", Type = "TechWorld", ContactInfo = "contact@techworld.com", CreatedAt = DateTime.UtcNow },
                        new Distributor { Id = "d2", Name = "ElectroCom", Type = "ElectroCom", ContactInfo = "contact@electrocom.com", CreatedAt = DateTime.UtcNow },
                        new Distributor { Id = "d3", Name = "Gadget Central", Type = "GadgetCentral", ContactInfo = "contact@gadgetcentral.com", CreatedAt = DateTime.UtcNow }
                    };

                    _context.Distributors.AddRange(distributors);
                    seededItems.Add("3 Distributors");
                }

                // Add sample products if they don't exist
                if (!await _context.Products.AnyAsync())
                {
                    var products = new List<Product>
                    {
                        new Product { Id = "p1", Name = "iPhone 15 Pro", Description = "Latest Apple smartphone with titanium design", Category = "Smartphones", Brand = "Apple", ImageUrl = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop&auto=format", CreatedAt = DateTime.UtcNow },
                        new Product { Id = "p2", Name = "Samsung Galaxy S24", Description = "Premium Android smartphone with AI features", Category = "Smartphones", Brand = "Samsung", ImageUrl = "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=300&fit=crop&auto=format", CreatedAt = DateTime.UtcNow },
                        new Product { Id = "p3", Name = "MacBook Air M3", Description = "Apple laptop with M3 chip and exceptional battery life", Category = "Laptops", Brand = "Apple", ImageUrl = "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=300&fit=crop&auto=format", CreatedAt = DateTime.UtcNow },
                        new Product { Id = "p4", Name = "Dell XPS 13", Description = "Ultra-portable Windows laptop with premium build", Category = "Laptops", Brand = "Dell", ImageUrl = "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=300&fit=crop&auto=format", CreatedAt = DateTime.UtcNow },
                        new Product { Id = "p5", Name = "AirPods Pro", Description = "Apple wireless earbuds with active noise cancellation", Category = "Audio", Brand = "Apple", ImageUrl = "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=300&fit=crop&auto=format", CreatedAt = DateTime.UtcNow }
                    };

                    _context.Products.AddRange(products);
                    seededItems.Add("5 Products");
                }

                // Add sample customer if doesn't exist
                if (!await _context.Customers.AnyAsync())
                {
                    var customer = new Customer 
                    { 
                        Id = "c1", 
                        FirstName = "Test", 
                        LastName = "User", 
                        Email = "test.user@example.com", 
                        Phone = "1234567890", 
                        Address = "123 Main St, New York, NY 10001",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                        CreatedAt = DateTime.UtcNow
                    };

                    _context.Customers.Add(customer);
                    seededItems.Add("1 Customer");
                }

                await _context.SaveChangesAsync();

                if (seededItems.Any())
                {
                    return Ok($"✅ Sample data seeded successfully: {string.Join(", ", seededItems)}");
                }
                else
                {
                    return Ok("✅ All sample data already exists - database is ready!");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"❌ Seeding error: {ex.Message}");
            }
        }

        [HttpGet("api-endpoints")]
        public IActionResult GetApiEndpoints()
        {
            var endpoints = new
            {
                Message = "The Gadget Hub API - All Available Endpoints",
                Authentication = "Add header: X-API-Key: gadgethub-api-key-2025",
                Endpoints = new
                {
                    Products = new[]
                    {
                        "GET /api/products - Get all products",
                        "GET /api/products/{id} - Get product by ID",
                        "GET /api/products/category/{category} - Get products by category",
                        "GET /api/products/search?term={term} - Search products",
                        "POST /api/products - Create product",
                        "PUT /api/products/{id} - Update product",
                        "DELETE /api/products/{id} - Delete product"
                    },
                    Cart = new[]
                    {
                        "GET /api/cart/{customerId} - Get cart items",
                        "POST /api/cart/{customerId}/add - Add item to cart",
                        "PUT /api/cart/{customerId}/update - Update cart item",
                        "DELETE /api/cart/{customerId}/remove/{productId} - Remove item",
                        "DELETE /api/cart/{customerId}/clear - Clear cart"
                    },
                    Quotations = new[]
                    {
                        "POST /api/quotations/request - Request quotes from all distributors",
                        "GET /api/quotations/request/{requestId}/responses - Get distributor responses",
                        "GET /api/quotations/request/{requestId}/best - Get best quotation",
                        "GET /api/quotations/customer/{customerId} - Get customer quotations"
                    },
                    Orders = new[]
                    {
                        "POST /api/orders - Create order",
                        "GET /api/orders/{id} - Get order details",
                        "GET /api/orders/customer/{customerId} - Get customer orders",
                        "PUT /api/orders/{id}/status - Update order status",
                        "GET /api/orders/{id}/track - Track order"
                    },
                    Customers = new[]
                    {
                        "GET /api/customers - Get all customers",
                        "GET /api/customers/{id} - Get customer by ID",
                        "POST /api/customers - Create customer",
                        "PUT /api/customers/{id} - Update customer"
                    },
                    Distributors = new[]
                    {
                        "GET /api/distributors - Get all distributors",
                        "GET /api/distributors/type/{type} - Get distributor by type",
                        "POST /api/distributors - Create distributor",
                        "PUT /api/distributors/{id} - Update distributor"
                    }
                }
            };

            return Ok(endpoints);
        }

        [HttpGet("services")]
        public async Task<IActionResult> TestServices()
        {
            try
            {
                var products = await _productService.GetAllProductsAsync();
                var customers = await _customerService.GetAllCustomersAsync();
                var distributors = await _distributorService.GetAllDistributorsAsync();

                return Ok(new
                {
                    Message = "All services working correctly!",
                    ServicesStatus = new
                    {
                        ProductService = $"✓ Working - {products.Count()} products",
                        CustomerService = $"✓ Working - {customers.Count()} customers", 
                        DistributorService = $"✓ Working - {distributors.Count()} distributors"
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Service error: {ex.Message}");
            }
        }

        [HttpGet("force-seed-distributors")]
        public async Task<IActionResult> ForceSeedDistributors()
        {
            try
            {
                // Remove existing distributors first (for clean setup)
                var existingDistributors = await _context.Distributors.ToListAsync();
                if (existingDistributors.Any())
                {
                    _context.Distributors.RemoveRange(existingDistributors);
                }

                // Add fresh distributors
                var distributors = new List<Distributor>
                {
                    new Distributor { Id = "d1", Name = "TechWorld", Type = "TechWorld", ContactInfo = "contact@techworld.com", CreatedAt = DateTime.UtcNow },
                    new Distributor { Id = "d2", Name = "ElectroCom", Type = "ElectroCom", ContactInfo = "contact@electrocom.com", CreatedAt = DateTime.UtcNow },
                    new Distributor { Id = "d3", Name = "Gadget Central", Type = "GadgetCentral", ContactInfo = "contact@gadgetcentral.com", CreatedAt = DateTime.UtcNow }
                };

                _context.Distributors.AddRange(distributors);
                await _context.SaveChangesAsync();

                return Ok("✅ Distributors force-seeded successfully! Quotation system should now work.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"❌ Force seeding error: {ex.Message}");
            }
        }
    }
} 