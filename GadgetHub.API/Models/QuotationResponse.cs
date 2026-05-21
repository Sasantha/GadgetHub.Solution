using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GadgetHub.API.Models
{
    public class QuotationResponse
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        [Required]
        [Column("RequestId")] // Maps to RequestId in database schema
        public string QuotationRequestId { get; set; } = string.Empty;
        
        [Required]
        public string DistributorId { get; set; } = string.Empty;
        
        [Required]
        public string ProductId { get; set; } = string.Empty;
        
        [Column(TypeName = "decimal(10,2)")]
        public decimal PricePerUnit { get; set; }
        
        public int AvailableQuantity { get; set; }
        
        public int? EstimatedDeliveryDays { get; set; }
        
        [Column(TypeName = "varchar(10)")]
        public string Status { get; set; } = "unseen";
        
        public DateTime RespondedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        [ForeignKey("QuotationRequestId")]
        public virtual QuotationRequest? QuotationRequest { get; set; }
        
        [ForeignKey("DistributorId")]
        public virtual Distributor? Distributor { get; set; }
        
        [ForeignKey("ProductId")]
        public virtual Product? Product { get; set; }
    }
} 