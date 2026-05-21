using System.ComponentModel.DataAnnotations;

namespace GadgetHub.API.Models
{
    public class Distributor
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(20)]
        public string Type { get; set; } = string.Empty; // TechWorld, ElectroCom, GadgetCentral
        
        [MaxLength(255)]
        public string? ContactInfo { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
} 