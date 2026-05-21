using GadgetHub.API.Models;

namespace GadgetHub.API.Services
{
    public interface IOrderService
    {
        // Quotation operations
        Task<IEnumerable<QuotationRequest>> RequestQuotationsAsync(string customerId, IEnumerable<CartItem> cartItems);
        Task<IEnumerable<QuotationResponse>> GetQuotationResponsesAsync(string requestId);
        Task<QuotationResponse> SimulateDistributorResponseAsync(QuotationRequest request, string distributorId);
        
        // Order operations
        Task<Order> CreateOrderAsync(string customerId, string distributorId, string productId, int quantity, decimal pricePerUnit);
        Task<IEnumerable<Order>> GetAllOrdersAsync();
        Task<IEnumerable<Order>> GetCustomerOrdersAsync(string customerId);
        Task<Order?> GetOrderByIdAsync(string orderId);
        Task UpdateOrderStatusAsync(string orderId, string status);
    }
} 