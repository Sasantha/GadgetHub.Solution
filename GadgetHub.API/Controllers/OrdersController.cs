using Microsoft.AspNetCore.Mvc;
using GadgetHub.API.Models;
using GadgetHub.API.Services;

namespace GadgetHub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly ICustomerService _customerService;
        private readonly IDistributorService _distributorService;
        private readonly IProductService _productService;

        public OrdersController(
            IOrderService orderService,
            ICustomerService customerService,
            IDistributorService distributorService,
            IProductService productService)
        {
            _orderService = orderService;
            _customerService = customerService;
            _distributorService = distributorService;
            _productService = productService;
        }

        // POST: api/orders - Customer places order (following database schema exactly)
        [HttpPost]
        public async Task<ActionResult<Order>> CreateOrder([FromBody] CreateOrderDto orderDto)
        {
            try
            {
                if (orderDto == null)
                    return BadRequest("Order data is required");

                // Validate required fields
                if (string.IsNullOrWhiteSpace(orderDto.CustomerId))
                    return BadRequest("Customer ID is required");

                if (string.IsNullOrWhiteSpace(orderDto.DistributorId))
                    return BadRequest("Distributor ID is required");

                if (string.IsNullOrWhiteSpace(orderDto.ProductId))
                    return BadRequest("Product ID is required");

                if (orderDto.Quantity <= 0)
                    return BadRequest("Quantity must be greater than 0");

                if (orderDto.PricePerUnit <= 0)
                    return BadRequest("Price per unit must be greater than 0");

                // Verify entities exist
                var customer = await _customerService.GetCustomerByIdAsync(orderDto.CustomerId);
                if (customer == null)
                    return BadRequest($"Customer with ID {orderDto.CustomerId} not found");

                var distributor = await _distributorService.GetDistributorByIdAsync(orderDto.DistributorId);
                if (distributor == null)
                    return BadRequest($"Distributor with ID {orderDto.DistributorId} not found");

                var product = await _productService.GetProductByIdAsync(orderDto.ProductId);
                if (product == null)
                    return BadRequest($"Product with ID {orderDto.ProductId} not found");

                // Create order using the correct service method signature
                var order = await _orderService.CreateOrderAsync(
                    orderDto.CustomerId,
                    orderDto.DistributorId,
                    orderDto.ProductId,
                    orderDto.Quantity,
                    orderDto.PricePerUnit
                );

                return Ok(order);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/orders/{id} - Get order details
        [HttpGet("{id}")]
        public async Task<ActionResult<Order>> GetOrder(string id)
        {
            try
            {
                var order = await _orderService.GetOrderByIdAsync(id);
                if (order == null)
                    return NotFound($"Order {id} not found");

                return Ok(order);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/orders - Get all orders (for admin)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Order>>> GetAllOrders()
        {
            try
            {
                var orders = await _orderService.GetAllOrdersAsync();
                return Ok(orders);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/orders/customer/{customerId} - Get customer's orders
        [HttpGet("customer/{customerId}")]
        public async Task<ActionResult<IEnumerable<Order>>> GetCustomerOrders(string customerId)
        {
            try
            {
                var orders = await _orderService.GetCustomerOrdersAsync(customerId);
                return Ok(orders);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // PUT: api/orders/{id}/status - Update order status
        [HttpPut("{id}/status")]
        public async Task<ActionResult<Order>> UpdateOrderStatus(string id, [FromBody] UpdateOrderStatusDto statusDto)
        {
            try
            {
                if (statusDto == null || string.IsNullOrWhiteSpace(statusDto.Status))
                    return BadRequest("Status is required");

                var validStatuses = new[] { "pending", "confirmed", "shipped", "delivered" };
                if (!validStatuses.Contains(statusDto.Status))
                    return BadRequest($"Invalid status. Valid statuses are: {string.Join(", ", validStatuses)}");

                var order = await _orderService.GetOrderByIdAsync(id);
                if (order == null)
                    return NotFound($"Order {id} not found");

                await _orderService.UpdateOrderStatusAsync(id, statusDto.Status);
                
                // Get the updated order
                var updatedOrder = await _orderService.GetOrderByIdAsync(id);
                return Ok(updatedOrder);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }

    // DTOs following database schema
    public class CreateOrderDto
    {
        public string CustomerId { get; set; } = string.Empty;
        public string DistributorId { get; set; } = string.Empty;
        public string ProductId { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal PricePerUnit { get; set; }
        public decimal TotalAmount { get; set; }
    }

    public class UpdateOrderStatusDto
    {
        public string Status { get; set; } = string.Empty;
    }
} 