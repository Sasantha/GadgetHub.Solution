using Microsoft.AspNetCore.Mvc;
using GadgetHub.API.Models;
using GadgetHub.API.Services;

namespace GadgetHub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;
        private readonly IProductService _productService;

        public CartController(ICartService cartService, IProductService productService)
        {
            _cartService = cartService;
            _productService = productService;
        }

        // GET: api/cart/{customerId}
        [HttpGet("{customerId}")]
        public async Task<ActionResult<IEnumerable<CartItem>>> GetCart(string customerId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(customerId))
                    return BadRequest("Customer ID is required");

                var cartItems = await _cartService.GetCartItemsAsync(customerId);
                return Ok(cartItems);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/cart/{customerId}/count
        [HttpGet("{customerId}/count")]
        public async Task<ActionResult<int>> GetCartItemCount(string customerId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(customerId))
                    return BadRequest("Customer ID is required");

                var count = await _cartService.GetCartItemCountAsync(customerId);
                return Ok(count);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST: api/cart/{customerId}/add
        [HttpPost("{customerId}/add")]
        public async Task<ActionResult<CartItem>> AddToCart(string customerId, [FromBody] AddToCartRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(customerId))
                    return BadRequest("Customer ID is required");

                if (request == null)
                    return BadRequest("Request data is required");

                if (string.IsNullOrWhiteSpace(request.ProductId))
                    return BadRequest("Product ID is required");

                if (request.Quantity <= 0)
                    return BadRequest("Quantity must be greater than 0");

                // Verify product exists
                var product = await _productService.GetProductByIdAsync(request.ProductId);
                if (product == null)
                    return BadRequest($"Product with ID {request.ProductId} not found");

                var cartItem = await _cartService.AddToCartAsync(customerId, request.ProductId, request.Quantity);
                return Ok(cartItem);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // PUT: api/cart/{customerId}/update
        [HttpPut("{customerId}/update")]
        public async Task<IActionResult> UpdateCartItem(string customerId, [FromBody] UpdateCartItemRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(customerId))
                    return BadRequest("Customer ID is required");

                if (request == null)
                    return BadRequest("Request data is required");

                if (string.IsNullOrWhiteSpace(request.ProductId))
                    return BadRequest("Product ID is required");

                if (request.Quantity < 0)
                    return BadRequest("Quantity cannot be negative");

                await _cartService.UpdateCartItemAsync(customerId, request.ProductId, request.Quantity);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // DELETE: api/cart/{customerId}/remove/{productId}
        [HttpDelete("{customerId}/remove/{productId}")]
        public async Task<IActionResult> RemoveFromCart(string customerId, string productId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(customerId))
                    return BadRequest("Customer ID is required");

                if (string.IsNullOrWhiteSpace(productId))
                    return BadRequest("Product ID is required");

                await _cartService.RemoveFromCartAsync(customerId, productId);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // DELETE: api/cart/{customerId}/clear
        [HttpDelete("{customerId}/clear")]
        public async Task<IActionResult> ClearCart(string customerId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(customerId))
                    return BadRequest("Customer ID is required");

                await _cartService.ClearCartAsync(customerId);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }

    // Request DTOs for Cart operations
    public class AddToCartRequest
    {
        public string ProductId { get; set; } = string.Empty;
        public int Quantity { get; set; }
    }

    public class UpdateCartItemRequest
    {
        public string ProductId { get; set; } = string.Empty;
        public int Quantity { get; set; }
    }
} 