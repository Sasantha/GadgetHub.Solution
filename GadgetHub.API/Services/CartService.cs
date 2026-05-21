using GadgetHub.API.Models;
using GadgetHub.API.Repositories;

namespace GadgetHub.API.Services
{
    public class CartService : ICartService
    {
        private readonly IRepository<CartItem> _cartRepository;
        private readonly IRepository<Product> _productRepository;

        public CartService(IRepository<CartItem> cartRepository, IRepository<Product> productRepository)
        {
            _cartRepository = cartRepository;
            _productRepository = productRepository;
        }

        public async Task<IEnumerable<CartItem>> GetCartItemsAsync(string customerId)
        {
            return await _cartRepository.FindAsync(c => c.CustomerId == customerId);
        }

        public async Task<CartItem> AddToCartAsync(string customerId, string productId, int quantity)
        {
            // Check if item already exists in cart
            var existingItems = await _cartRepository.FindAsync(c => c.CustomerId == customerId && c.ProductId == productId);
            var existingItem = existingItems.FirstOrDefault();

            if (existingItem != null)
            {
                // Update quantity if item exists
                existingItem.Quantity += quantity;
                await _cartRepository.UpdateAsync(existingItem);
                return existingItem;
            }
            else
            {
                // Add new item to cart
                var cartItem = new CartItem
                {
                    Id = Guid.NewGuid().ToString(),
                    CustomerId = customerId,
                    ProductId = productId,
                    Quantity = quantity,
                    AddedAt = DateTime.UtcNow
                };

                return await _cartRepository.AddAsync(cartItem);
            }
        }

        public async Task UpdateCartItemAsync(string customerId, string productId, int quantity)
        {
            var existingItems = await _cartRepository.FindAsync(c => c.CustomerId == customerId && c.ProductId == productId);
            var existingItem = existingItems.FirstOrDefault();

            if (existingItem != null)
            {
                if (quantity <= 0)
                {
                    await _cartRepository.DeleteAsync(existingItem.Id);
                }
                else
                {
                    existingItem.Quantity = quantity;
                    await _cartRepository.UpdateAsync(existingItem);
                }
            }
        }

        public async Task RemoveFromCartAsync(string customerId, string productId)
        {
            var existingItems = await _cartRepository.FindAsync(c => c.CustomerId == customerId && c.ProductId == productId);
            var existingItem = existingItems.FirstOrDefault();

            if (existingItem != null)
            {
                await _cartRepository.DeleteAsync(existingItem.Id);
            }
        }

        public async Task ClearCartAsync(string customerId)
        {
            var cartItems = await _cartRepository.FindAsync(c => c.CustomerId == customerId);
            foreach (var item in cartItems)
            {
                await _cartRepository.DeleteAsync(item.Id);
            }
        }

        public async Task<int> GetCartItemCountAsync(string customerId)
        {
            var cartItems = await _cartRepository.FindAsync(c => c.CustomerId == customerId);
            return cartItems.Sum(c => c.Quantity);
        }
    }
} 