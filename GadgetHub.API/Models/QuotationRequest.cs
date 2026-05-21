using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GadgetHub.API.Models
{
    public class QuotationRequest
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        [Required]
        public string CustomerId { get; set; } = string.Empty;
        
        [Required]
        public string ProductId { get; set; } = string.Empty;
        
        public int Quantity { get; set; }
        
        [MaxLength(20)]
        public string Status { get; set; } = "pending"; // pending, completed
        
        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        [ForeignKey("CustomerId")]
        public virtual Customer? Customer { get; set; }
        
        [ForeignKey("ProductId")]
        public virtual Product? Product { get; set; }
        
        // Collection navigation property for responses
        public virtual ICollection<QuotationResponse> QuotationResponses { get; set; } = new List<QuotationResponse>();
    }
} 