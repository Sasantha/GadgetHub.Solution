using Microsoft.AspNetCore.Mvc;
using GadgetHub.API.Models;
using GadgetHub.API.Services;

namespace GadgetHub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuotationsController : ControllerBase
    {
        private readonly IQuotationService _quotationService;
        private readonly ICustomerService _customerService;
        private readonly IProductService _productService;
        private readonly IDistributorService _distributorService; // Added for new validation

        public QuotationsController(
            IQuotationService quotationService, 
            ICustomerService customerService,
            IProductService productService,
            IDistributorService distributorService) // Added distributorService to constructor
        {
            _quotationService = quotationService;
            _customerService = customerService;
            _productService = productService;
            _distributorService = distributorService; // Initialize distributorService
        }

        // POST: api/quotations/request - Customer requests quotation for a single product
        [HttpPost("request")]
        public async Task<ActionResult<QuotationRequest>> RequestQuotation([FromBody] QuotationRequestDto request)
        {
            try
            {
                if (request == null)
                    return BadRequest("Request data is required");

                if (string.IsNullOrWhiteSpace(request.CustomerId))
                    return BadRequest("Customer ID is required");

                if (string.IsNullOrWhiteSpace(request.ProductId))
                    return BadRequest("Product ID is required");

                if (request.Quantity <= 0)
                    return BadRequest("Quantity must be greater than 0");

                // Verify customer exists
                var customer = await _customerService.GetCustomerByIdAsync(request.CustomerId);
                if (customer == null)
                    return BadRequest($"Customer with ID {request.CustomerId} not found");

                // Verify product exists
                var product = await _productService.GetProductByIdAsync(request.ProductId);
                if (product == null)
                    return BadRequest($"Product with ID {request.ProductId} not found");

                // Create quotation request - following database schema exactly
                var quotationRequest = new QuotationRequest
                {
                    Id = Guid.NewGuid().ToString(),
                    CustomerId = request.CustomerId,
                    ProductId = request.ProductId,
                    Quantity = request.Quantity,
                    Status = "pending", // Admin will add responses later
                    RequestedAt = DateTime.UtcNow
                };

                var savedRequest = await _quotationService.CreateQuotationRequestAsync(quotationRequest);
                return Ok(savedRequest);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/quotations/request/{requestId}/responses - Get distributor responses
        [HttpGet("request/{requestId}/responses")]
        public async Task<ActionResult<IEnumerable<QuotationResponse>>> GetQuotationResponses(string requestId)
        {
            try
            {
                var responses = await _quotationService.GetQuotationResponsesAsync(requestId);
                return Ok(responses);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/quotations/request/{requestId} - Get quotation request details
        [HttpGet("request/{requestId}")]
        public async Task<ActionResult<QuotationRequest>> GetQuotationRequest(string requestId)
        {
            try
            {
                var request = await _quotationService.GetQuotationRequestByIdAsync(requestId);
                if (request == null)
                    return NotFound($"Quotation request {requestId} not found");

                return Ok(request);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/quotations/customer/{customerId} - Get customer's quotation requests
        [HttpGet("customer/{customerId}")]
        public async Task<ActionResult<IEnumerable<QuotationRequest>>> GetCustomerQuotations(string customerId)
        {
            try
            {
                var requests = await _quotationService.GetCustomerQuotationRequestsAsync(customerId);
                
                // Update status for requests that have 3 responses but are still pending
                foreach (var request in requests)
                {
                    if (request.Status == "pending" && request.QuotationResponses?.Count() >= 3)
                    {
                        await _quotationService.UpdateQuotationRequestStatusAsync(request.Id, "completed");
                        request.Status = "completed"; // Update the local object for immediate response
                    }
                }
                
                return Ok(requests);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // === ADMIN ENDPOINTS ===

        // GET: api/quotations/admin/pending - Get all pending quotation requests
        [HttpGet("admin/pending")]
        public async Task<ActionResult<IEnumerable<object>>> GetPendingQuotationRequests()
        {
            try
            {
                var pendingRequests = await _quotationService.GetPendingQuotationRequestsAsync();
                
                // Update status for requests that have 3 responses but are still pending
                foreach (var request in pendingRequests)
                {
                    if (request.Status == "pending" && request.QuotationResponses?.Count() >= 3)
                    {
                        await _quotationService.UpdateQuotationRequestStatusAsync(request.Id, "completed");
                        request.Status = "completed"; // Update the local object for immediate response
                    }
                }
                
                var adminRequests = pendingRequests.Select(req => new
                {
                    id = req.Id,
                    customerId = req.CustomerId,
                    customerName = $"{req.Customer?.FirstName} {req.Customer?.LastName}",
                    customerEmail = req.Customer?.Email,
                    productId = req.ProductId,
                    productName = req.Product?.Name,
                    quantity = req.Quantity,
                    status = req.Status,
                    requestedAt = req.RequestedAt,
                    responseCount = req.QuotationResponses?.Count() ?? 0
                });

                return Ok(adminRequests);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST: api/quotations/admin/response - Admin adds distributor response
        [HttpPost("admin/response")]
        public async Task<ActionResult<QuotationResponse>> AddDistributorResponse([FromBody] AddQuotationResponseDto responseDto)
        {
            try
            {
                if (responseDto == null)
                    return BadRequest("Response data is required");

                // Validate required fields
                if (string.IsNullOrWhiteSpace(responseDto.RequestId))
                    return BadRequest("Request ID is required");

                if (string.IsNullOrWhiteSpace(responseDto.DistributorId))
                    return BadRequest("Distributor ID is required");

                if (string.IsNullOrWhiteSpace(responseDto.ProductId))
                    return BadRequest("Product ID is required");

                if (responseDto.PricePerUnit <= 0)
                    return BadRequest("Price per unit must be greater than 0");

                if (responseDto.AvailableQuantity <= 0)
                    return BadRequest("Available quantity must be greater than 0");

                if (responseDto.EstimatedDeliveryDays <= 0)
                    return BadRequest("Estimated delivery days must be greater than 0");

                // Verify quotation request exists
                var quotationRequest = await _quotationService.GetQuotationRequestByIdAsync(responseDto.RequestId);
                if (quotationRequest == null)
                    return BadRequest($"Quotation request with ID {responseDto.RequestId} not found");

                // Verify distributor exists
                var distributor = await _distributorService.GetDistributorByIdAsync(responseDto.DistributorId);
                if (distributor == null)
                    return BadRequest($"Distributor with ID {responseDto.DistributorId} not found");

                // Verify product exists
                var product = await _productService.GetProductByIdAsync(responseDto.ProductId);
                if (product == null)
                    return BadRequest($"Product with ID {responseDto.ProductId} not found");

                // Create quotation response - following database schema exactly
                var response = new QuotationResponse
                {
                    Id = Guid.NewGuid().ToString(),
                    QuotationRequestId = responseDto.RequestId, // Maps to RequestId in schema
                    DistributorId = responseDto.DistributorId,
                    ProductId = responseDto.ProductId,
                    PricePerUnit = responseDto.PricePerUnit,
                    AvailableQuantity = responseDto.AvailableQuantity,
                    EstimatedDeliveryDays = responseDto.EstimatedDeliveryDays,
                    RespondedAt = DateTime.UtcNow
                };

                var savedResponse = await _quotationService.CreateQuotationResponseAsync(response);
                
                // Check if we now have all 3 responses and update status to completed
                var allResponses = await _quotationService.GetQuotationResponsesAsync(responseDto.RequestId);
                if (allResponses.Count() >= 3)
                {
                    await _quotationService.UpdateQuotationRequestStatusAsync(responseDto.RequestId, "completed");
                }
                
                return Ok(savedResponse);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/quotations/admin/request/{requestId}/available-distributors - Get distributors that haven't responded
        [HttpGet("admin/request/{requestId}/available-distributors")]
        public async Task<ActionResult<IEnumerable<object>>> GetAvailableDistributors(string requestId)
        {
            try
            {
                // Get all distributors
                var allDistributors = await _distributorService.GetAllDistributorsAsync();
                
                // Get distributors that have already responded to this request
                var responses = await _quotationService.GetQuotationResponsesAsync(requestId);
                var respondedDistributorIds = responses.Select(r => r.DistributorId).ToHashSet();
                
                // Filter out distributors that have already responded
                var availableDistributors = allDistributors
                    .Where(d => !respondedDistributorIds.Contains(d.Id))
                    .Select(d => new
                    {
                        id = d.Id,
                        name = d.Name,
                        type = d.Type
                    });

                return Ok(availableDistributors);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST: api/quotations/admin/update-statuses - Update status for existing requests with 3 responses
        [HttpPost("admin/update-statuses")]
        public async Task<ActionResult<object>> UpdateQuotationStatuses()
        {
            try
            {
                var pendingRequests = await _quotationService.GetPendingQuotationRequestsAsync();
                var updatedCount = 0;

                foreach (var request in pendingRequests)
                {
                    if (request.Status == "pending" && request.QuotationResponses?.Count() >= 3)
                    {
                        await _quotationService.UpdateQuotationRequestStatusAsync(request.Id, "completed");
                        updatedCount++;
                    }
                }

                return Ok(new { 
                    message = $"Updated {updatedCount} quotation requests from pending to completed",
                    updatedCount = updatedCount
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/quotations/customer/{customerId}/unseen-responses - Get unseen responses for notifications
        [HttpGet("customer/{customerId}/unseen-responses")]
        public async Task<ActionResult<IEnumerable<object>>> GetUnseenResponses(string customerId)
        {
            try
            {
                var unseenResponses = await _quotationService.GetUnseenQuotationResponsesAsync(customerId);
                
                var responseData = unseenResponses.Select(response => new
                {
                    response.Id,
                    response.QuotationRequestId,
                    response.DistributorId,
                    response.ProductId,
                    response.PricePerUnit,
                    response.AvailableQuantity,
                    response.EstimatedDeliveryDays,
                    response.Status,
                    response.RespondedAt,
                    // Include product name for notification
                    ProductName = response.Product?.Name ?? $"Product {response.ProductId}",
                    DistributorName = response.Distributor?.Name ?? $"Distributor {response.DistributorId}"
                });

                return Ok(responseData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST: api/quotations/response/{responseId}/mark-seen - Mark response as seen
        [HttpPost("response/{responseId}/mark-seen")]
        public async Task<ActionResult<object>> MarkResponseAsSeen(string responseId)
        {
            try
            {
                await _quotationService.MarkQuotationResponseAsSeenAsync(responseId);
                return Ok(new { message = "Response marked as seen successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST: api/quotations/customer/{customerId}/update-statuses - Update status for customer's requests with 3 responses
        [HttpPost("customer/{customerId}/update-statuses")]
        public async Task<ActionResult<object>> UpdateCustomerQuotationStatuses(string customerId)
        {
            try
            {
                var customerRequests = await _quotationService.GetCustomerQuotationRequestsAsync(customerId);
                var updatedCount = 0;

                foreach (var request in customerRequests)
                {
                    if (request.Status == "pending" && request.QuotationResponses?.Count() >= 3)
                    {
                        await _quotationService.UpdateQuotationRequestStatusAsync(request.Id, "completed");
                        updatedCount++;
                    }
                }

                return Ok(new { 
                    message = $"Updated {updatedCount} quotation requests from pending to completed",
                    updatedCount = updatedCount
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }

    // DTOs following database schema
    public class QuotationRequestDto
    {
        public string CustomerId { get; set; } = string.Empty;
        public string ProductId { get; set; } = string.Empty;
        public int Quantity { get; set; }
    }

    public class AddQuotationResponseDto
    {
        public string RequestId { get; set; } = string.Empty;
        public string DistributorId { get; set; } = string.Empty;
        public string ProductId { get; set; } = string.Empty;
        public decimal PricePerUnit { get; set; }
        public int AvailableQuantity { get; set; }
        public int EstimatedDeliveryDays { get; set; }
    }
} 