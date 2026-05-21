using GadgetHub.API.Models;

namespace GadgetHub.API.Services
{
    public interface IQuotationService
    {
        // Quotation Requests
        Task<QuotationRequest> CreateQuotationRequestAsync(QuotationRequest request);
        Task<QuotationRequest?> GetQuotationRequestByIdAsync(string requestId);
        Task<IEnumerable<QuotationRequest>> GetCustomerQuotationRequestsAsync(string customerId);
        Task<IEnumerable<QuotationRequest>> GetPendingQuotationRequestsAsync();

        // Quotation Responses
        Task<QuotationResponse> CreateQuotationResponseAsync(QuotationResponse response);
        Task<IEnumerable<QuotationResponse>> GetQuotationResponsesAsync(string requestId);
        Task<IEnumerable<QuotationResponse>> GetUnseenQuotationResponsesAsync(string customerId);
        Task<QuotationResponse?> GetQuotationResponseByIdAsync(string responseId);
        Task MarkQuotationResponseAsSeenAsync(string responseId);

        // Utility
        Task UpdateQuotationRequestStatusAsync(string requestId, string status);
        Task<QuotationResponse?> GetBestQuotationAsync(string requestId);
    }
} 