namespace GadgetHub.API.Models
{
    // DTOs for Admin Quotation Management

    public class AdminQuotationResponseDto
    {
        public string QuotationRequestId { get; set; } = string.Empty;
        public string DistributorId { get; set; } = string.Empty;
        public decimal PricePerUnit { get; set; }
        public int AvailableQuantity { get; set; }
        public int EstimatedDeliveryDays { get; set; }
        public string? Notes { get; set; }
    }

    public class ApproveQuotationDto
    {
        public string SelectedResponseId { get; set; } = string.Empty;
        public string? AdminNotes { get; set; }
    }

    public class QuotationSummaryDto
    {
        public string Id { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime RequestedAt { get; set; }
        public int ResponseCount { get; set; }
        public bool NeedsResponse { get; set; }
        public string Priority { get; set; } = "normal"; // high, normal, low
    }

    public class DistributorQuoteDto
    {
        public string DistributorType { get; set; } = string.Empty;
        public string DistributorName { get; set; } = string.Empty;
        public decimal PricePerUnit { get; set; }
        public int AvailableQuantity { get; set; }
        public int EstimatedDeliveryDays { get; set; }
        public string? Notes { get; set; }
    }
} 