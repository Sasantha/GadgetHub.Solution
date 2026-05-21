using GadgetHub.API.Models;

namespace GadgetHub.API.Services
{
    public interface ICartService
    {
        Task<IEnumerable<CartItem>> GetCartItemsAsync(string customerId);
        Task<CartItem> AddToCartAsync(string customerId, string productId, int quantity);
        Task UpdateCartItemAsync(string customerId, string productId, int quantity);
        Task RemoveFromCartAsync(string customerId, string productId);
        Task ClearCartAsync(string customerId);
        Task<int> GetCartItemCountAsync(string customerId);
    }
} 