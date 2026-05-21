using GadgetHub.API.Models;
using GadgetHub.API.Repositories;

namespace GadgetHub.API.Services
{
    public class QuotationService : IQuotationService
    {
        private readonly IRepository<QuotationRequest> _quotationRequestRepository;
        private readonly IRepository<QuotationResponse> _quotationResponseRepository;
        private readonly IRepository<Product> _productRepository;
        private readonly IRepository<Customer> _customerRepository;

        public QuotationService(
            IRepository<QuotationRequest> quotationRequestRepository,
            IRepository<QuotationResponse> quotationResponseRepository,
            IRepository<Product> productRepository,
            IRepository<Customer> customerRepository)
        {
            _quotationRequestRepository = quotationRequestRepository;
            _quotationResponseRepository = quotationResponseRepository;
            _productRepository = productRepository;
            _customerRepository = customerRepository;
        }

        // === QUOTATION REQUESTS (Following Database Schema) ===

        public async Task<QuotationRequest> CreateQuotationRequestAsync(QuotationRequest request)
        {
            return await _quotationRequestRepository.AddAsync(request);
        }

        public async Task<QuotationRequest?> GetQuotationRequestByIdAsync(string requestId)
        {
            return await _quotationRequestRepository.GetByIdAsync(requestId);
        }

        public async Task<IEnumerable<QuotationRequest>> GetCustomerQuotationRequestsAsync(string customerId)
        {
            var requests = await _quotationRequestRepository.FindAsync(qr => qr.CustomerId == customerId);
            
            // For each request, load the responses and related entities
            var requestsWithResponses = new List<QuotationRequest>();
            foreach (var request in requests)
            {
                // Load responses
                var responses = await _quotationResponseRepository.FindAsync(qr => qr.QuotationRequestId == request.Id);
                request.QuotationResponses = responses.ToList();
                
                // Load related entities (Product and Customer)
                await LoadRelatedEntitiesAsync(request);
                
                requestsWithResponses.Add(request);
            }

            return requestsWithResponses;
        }

        public async Task<IEnumerable<QuotationRequest>> GetPendingQuotationRequestsAsync()
        {
            // Get all requests with status 'pending', 'processing', 'completed', 'failed'
            var requests = await _quotationRequestRepository.FindAsync(qr => 
                qr.Status == "pending" || 
                qr.Status == "processing" || 
                qr.Status == "completed" || 
                qr.Status == "failed"
            );

            // For each request, load the responses and related entities
            var requestsWithResponses = new List<QuotationRequest>();
            foreach (var request in requests)
            {
                var responses = await _quotationResponseRepository.FindAsync(qr => qr.QuotationRequestId == request.Id);
                request.QuotationResponses = responses.ToList();
                
                // Load related entities (Product and Customer)
                await LoadRelatedEntitiesAsync(request);
                
                requestsWithResponses.Add(request);
            }

            // Sort: pending first, then completed, then others
            return requestsWithResponses.OrderBy(r => 
                r.Status == "pending" ? 0 : 
                r.Status == "completed" ? 1 : 2
            ).ThenByDescending(r => r.RequestedAt);
        }

        // === QUOTATION RESPONSES (Following Database Schema) ===

        public async Task<QuotationResponse> CreateQuotationResponseAsync(QuotationResponse response)
        {
            return await _quotationResponseRepository.AddAsync(response);
        }

        public async Task<IEnumerable<QuotationResponse>> GetQuotationResponsesAsync(string requestId)
        {
            var responses = await _quotationResponseRepository.FindAsync(qr => qr.QuotationRequestId == requestId);
            
            // Load distributor information for each response
            var responsesWithDistributors = new List<QuotationResponse>();
            foreach (var response in responses)
            {
                // The distributor information should be loaded by Entity Framework
                // If not, we can manually load it here if needed
                responsesWithDistributors.Add(response);
            }
            
            return responsesWithDistributors;
        }

        public async Task<QuotationResponse?> GetQuotationResponseByIdAsync(string responseId)
        {
            return await _quotationResponseRepository.GetByIdAsync(responseId);
        }

        public async Task<IEnumerable<QuotationResponse>> GetUnseenQuotationResponsesAsync(string customerId)
        {
            // Get all quotation requests for the customer
            var customerRequests = await _quotationRequestRepository.FindAsync(qr => qr.CustomerId == customerId);
            var requestIds = customerRequests.Select(r => r.Id).ToList();
            
            // Get all unseen responses for these requests
            var unseenResponses = await _quotationResponseRepository.FindAsync(qr => 
                requestIds.Contains(qr.QuotationRequestId) && qr.Status == "unseen"
            );
            
            return unseenResponses;
        }

        public async Task MarkQuotationResponseAsSeenAsync(string responseId)
        {
            var response = await _quotationResponseRepository.GetByIdAsync(responseId);
            if (response != null)
            {
                response.Status = "seen";
                await _quotationResponseRepository.UpdateAsync(response);
            }
        }

        // === UTILITY METHODS ===

        public async Task UpdateQuotationRequestStatusAsync(string requestId, string status)
        {
            var request = await _quotationRequestRepository.GetByIdAsync(requestId);
            if (request != null)
            {
                request.Status = status;
                await _quotationRequestRepository.UpdateAsync(request);
            }
        }

                public async Task<QuotationResponse?> GetBestQuotationAsync(string requestId)
        {
            var responses = await GetQuotationResponsesAsync(requestId);
            return responses.OrderBy(r => r.PricePerUnit).FirstOrDefault();
        }

        // Helper method to load related entities
        private async Task LoadRelatedEntitiesAsync(QuotationRequest request)
        {
            // Load Product details
            if (!string.IsNullOrEmpty(request.ProductId))
            {
                request.Product = await _productRepository.GetByIdAsync(request.ProductId);
            }

            // Load Customer details
            if (!string.IsNullOrEmpty(request.CustomerId))
            {
                request.Customer = await _customerRepository.GetByIdAsync(request.CustomerId);
            }
        }
    }
} 