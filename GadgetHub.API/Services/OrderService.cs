using GadgetHub.API.Models;
using GadgetHub.API.Repositories;

namespace GadgetHub.API.Services
{
    public class OrderService : IOrderService
    {
        private readonly IRepository<QuotationRequest> _quotationRequestRepository;
        private readonly IRepository<QuotationResponse> _quotationResponseRepository;
        private readonly IRepository<Order> _orderRepository;
        private readonly IRepository<Distributor> _distributorRepository;
        private readonly IRepository<Product> _productRepository;
        private readonly IRepository<Customer> _customerRepository;

        public OrderService(
            IRepository<QuotationRequest> quotationRequestRepository,
            IRepository<QuotationResponse> quotationResponseRepository,
            IRepository<Order> orderRepository,
            IRepository<Distributor> distributorRepository,
            IRepository<Product> productRepository,
            IRepository<Customer> customerRepository)
        {
            _quotationRequestRepository = quotationRequestRepository;
            _quotationResponseRepository = quotationResponseRepository;
            _orderRepository = orderRepository;
            _distributorRepository = distributorRepository;
            _productRepository = productRepository;
            _customerRepository = customerRepository;
        }

        public async Task<IEnumerable<QuotationRequest>> RequestQuotationsAsync(string customerId, IEnumerable<CartItem> cartItems)
        {
            var quotationRequests = new List<QuotationRequest>();

            foreach (var cartItem in cartItems)
            {
                var quotationRequest = new QuotationRequest
                {
                    Id = Guid.NewGuid().ToString(),
                    CustomerId = customerId,
                    ProductId = cartItem.ProductId,
                    Quantity = cartItem.Quantity,
                    Status = "pending",
                    RequestedAt = DateTime.UtcNow
                };

                var savedRequest = await _quotationRequestRepository.AddAsync(quotationRequest);
                quotationRequests.Add(savedRequest);

                // Simulate getting responses from all 3 distributors
                await SimulateAllDistributorResponsesAsync(savedRequest);
            }

            return quotationRequests;
        }

        private async Task SimulateAllDistributorResponsesAsync(QuotationRequest request)
        {
            var distributors = await _distributorRepository.GetAllAsync();

            foreach (var distributor in distributors)
            {
                await SimulateDistributorResponseAsync(request, distributor.Id);
            }

            // Mark request as completed
            request.Status = "completed";
            await _quotationRequestRepository.UpdateAsync(request);
        }

        public async Task<QuotationResponse> SimulateDistributorResponseAsync(QuotationRequest request, string distributorId)
        {
            // Simple simulation - generate random prices and availability
            var random = new Random();
            var basePrice = random.Next(100, 1000); // Random base price between $100-$1000
            var availability = random.Next(1, 50); // Random availability 1-50 units
            var deliveryDays = random.Next(1, 14); // Random delivery 1-14 days

            var response = new QuotationResponse
            {
                Id = Guid.NewGuid().ToString(),
                QuotationRequestId = request.Id,
                DistributorId = distributorId,
                ProductId = request.ProductId,
                PricePerUnit = basePrice,
                AvailableQuantity = availability,
                EstimatedDeliveryDays = deliveryDays,
                RespondedAt = DateTime.UtcNow
            };

            return await _quotationResponseRepository.AddAsync(response);
        }

        public async Task<IEnumerable<QuotationResponse>> GetQuotationResponsesAsync(string requestId)
        {
            return await _quotationResponseRepository.FindAsync(qr => qr.QuotationRequestId == requestId);
        }

        public async Task<Order> CreateOrderAsync(string customerId, string distributorId, string productId, int quantity, decimal pricePerUnit)
        {
            var order = new Order
            {
                Id = Guid.NewGuid().ToString(),
                CustomerId = customerId,
                DistributorId = distributorId,
                ProductId = productId,
                Quantity = quantity,
                PricePerUnit = pricePerUnit,
                TotalAmount = quantity * pricePerUnit,
                Status = "pending",
                PlacedAt = DateTime.UtcNow
            };

            return await _orderRepository.AddAsync(order);
        }

        public async Task<IEnumerable<Order>> GetAllOrdersAsync()
        {
            var orders = await _orderRepository.GetAllAsync();
            
            // Load navigation properties for each order
            var ordersWithNav = new List<Order>();
            foreach (var order in orders)
            {
                // Load Customer
                if (!string.IsNullOrEmpty(order.CustomerId))
                {
                    order.Customer = await _customerRepository.GetByIdAsync(order.CustomerId);
                }
                
                // Load Product
                if (!string.IsNullOrEmpty(order.ProductId))
                {
                    order.Product = await _productRepository.GetByIdAsync(order.ProductId);
                }
                
                // Load Distributor
                if (!string.IsNullOrEmpty(order.DistributorId))
                {
                    order.Distributor = await _distributorRepository.GetByIdAsync(order.DistributorId);
                }
                
                ordersWithNav.Add(order);
            }
            
            return ordersWithNav;
        }

        public async Task<IEnumerable<Order>> GetCustomerOrdersAsync(string customerId)
        {
            var orders = await _orderRepository.FindAsync(o => o.CustomerId == customerId);
            
            // Load navigation properties for each order
            var ordersWithNav = new List<Order>();
            foreach (var order in orders)
            {
                // Load Product
                if (!string.IsNullOrEmpty(order.ProductId))
                {
                    order.Product = await _productRepository.GetByIdAsync(order.ProductId);
                }
                
                // Load Distributor
                if (!string.IsNullOrEmpty(order.DistributorId))
                {
                    order.Distributor = await _distributorRepository.GetByIdAsync(order.DistributorId);
                }
                
                ordersWithNav.Add(order);
            }
            
            return ordersWithNav;
        }

        public async Task<Order?> GetOrderByIdAsync(string orderId)
        {
            return await _orderRepository.GetByIdAsync(orderId);
        }

        public async Task UpdateOrderStatusAsync(string orderId, string status)
        {
            var order = await _orderRepository.GetByIdAsync(orderId);
            if (order != null)
            {
                order.Status = status;
                await _orderRepository.UpdateAsync(order);
            }
        }
    }
} 