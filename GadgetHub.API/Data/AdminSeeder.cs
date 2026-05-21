using GadgetHub.API.Models;
using BC = BCrypt.Net.BCrypt;

namespace GadgetHub.API.Data
{
    public static class AdminSeeder
    {
        public static async Task SeedAdminsAsync(GadgetHubDbContext context, string? seedAdminPassword)
        {
            // Check if admins already exist
            if (context.Admins.Any())
                return;

            if (string.IsNullOrWhiteSpace(seedAdminPassword))
            {
                throw new InvalidOperationException(
                    "GadgetHub:SeedAdminPassword is not configured. Set GadgetHub__SeedAdminPassword before seeding default admin users."
                );
            }

            var passwordHash = BC.HashPassword(seedAdminPassword);
            var admins = new List<Admin>
            {
                new Admin
                {
                    Id = Guid.NewGuid().ToString(),
                    Username = "admin",
                    Email = "admin@gadgethub.com",
                    PasswordHash = passwordHash,
                    FirstName = "System",
                    LastName = "Administrator",
                    Role = "super_admin",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Admin
                {
                    Id = Guid.NewGuid().ToString(),
                    Username = "manager1",
                    Email = "manager@gadgethub.com",
                    PasswordHash = passwordHash,
                    FirstName = "Michael",
                    LastName = "Manager",
                    Role = "manager",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Admin
                {
                    Id = Guid.NewGuid().ToString(),
                    Username = "support1",
                    Email = "support@gadgethub.com",
                    PasswordHash = passwordHash,
                    FirstName = "Sarah",
                    LastName = "Support",
                    Role = "admin",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }
            };

            context.Admins.AddRange(admins);
            await context.SaveChangesAsync();
        }
    }
} 
