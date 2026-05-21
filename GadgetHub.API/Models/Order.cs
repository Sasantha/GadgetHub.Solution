using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GadgetHub.API.Models
{
    public class Order
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        [Required]
        public string CustomerId { get; set; } = string.Empty;
        
        [Required]
        public string DistributorId { get; set; } = string.Empty;
        
        [Required]
        public string ProductId { get; set; } = string.Empty;
        
        public int Quantity { get; set; }
        
        [Column(TypeName = "decimal(10,2)")]
        public decimal PricePerUnit { get; set; }
        
        [Column(TypeName = "decimal(10,2)")]
        public decimal TotalAmount { get; set; }
        
        [MaxLength(20)]
        public string Status { get; set; } = "pending"; // pending, confirmed, shipped, delivered
        
        [MaxLength(100)]
        public string? DistributorOrderId { get; set; }
        
        public DateTime? EstimatedDelivery { get; set; }
        
        public DateTime PlacedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        [ForeignKey("CustomerId")]
        public virtual Customer? Customer { get; set; }
        
        [ForeignKey("DistributorId")]
        public virtual Distributor? Distributor { get; set; }
        
        [ForeignKey("ProductId")]
        public virtual Product? Product { get; set; }
    }
} 