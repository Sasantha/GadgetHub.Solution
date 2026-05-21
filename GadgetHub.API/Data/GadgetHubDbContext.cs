using Microsoft.EntityFrameworkCore;
using GadgetHub.API.Models;

namespace GadgetHub.API.Data
{
    public class GadgetHubDbContext : DbContext
    {
        public GadgetHubDbContext(DbContextOptions<GadgetHubDbContext> options) : base(options)
        {
        }

        public DbSet<Product> Products { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Distributor> Distributors { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<QuotationRequest> QuotationRequests { get; set; }
        public DbSet<QuotationResponse> QuotationResponses { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<Admin> Admins { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure table names to match our database schema
            modelBuilder.Entity<Product>().ToTable("Products");
            modelBuilder.Entity<Customer>().ToTable("Customers");
            modelBuilder.Entity<Distributor>().ToTable("Distributors");
            modelBuilder.Entity<CartItem>().ToTable("CartItems");
            modelBuilder.Entity<QuotationRequest>().ToTable("QuotationRequests");
            modelBuilder.Entity<QuotationResponse>().ToTable("QuotationResponses");
            modelBuilder.Entity<Order>().ToTable("Orders");
            modelBuilder.Entity<Admin>().ToTable("Admins");

            // Configure relationships
            modelBuilder.Entity<CartItem>()
                .HasOne(ci => ci.Customer)
                .WithMany()
                .HasForeignKey(ci => ci.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CartItem>()
                .HasOne(ci => ci.Product)
                .WithMany()
                .HasForeignKey(ci => ci.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<QuotationRequest>()
                .HasOne(qr => qr.Customer)
                .WithMany()
                .HasForeignKey(qr => qr.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<QuotationRequest>()
                .HasOne(qr => qr.Product)
                .WithMany()
                .HasForeignKey(qr => qr.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<QuotationResponse>()
                .HasOne(qr => qr.QuotationRequest)
                .WithMany(req => req.QuotationResponses)
                .HasForeignKey(qr => qr.QuotationRequestId)
                .OnDelete(DeleteBehavior.Cascade);

            // Explicitly configure the QuotationRequestId column mapping
            modelBuilder.Entity<QuotationResponse>()
                .Property(qr => qr.QuotationRequestId)
                .HasColumnName("RequestId");

            modelBuilder.Entity<QuotationResponse>()
                .HasOne(qr => qr.Distributor)
                .WithMany()
                .HasForeignKey(qr => qr.DistributorId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<QuotationResponse>()
                .HasOne(qr => qr.Product)
                .WithMany()
                .HasForeignKey(qr => qr.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Order>()
                .HasOne(o => o.Customer)
                .WithMany()
                .HasForeignKey(o => o.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Order>()
                .HasOne(o => o.Distributor)
                .WithMany()
                .HasForeignKey(o => o.DistributorId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Order>()
                .HasOne(o => o.Product)
                .WithMany()
                .HasForeignKey(o => o.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
} 