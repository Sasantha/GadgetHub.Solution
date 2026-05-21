using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace GadgetHub.API.Data
{
    public class GadgetHubDbContextFactory : IDesignTimeDbContextFactory<GadgetHubDbContext>
    {
        public GadgetHubDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<GadgetHubDbContext>();
            var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
                ?? "server=localhost;port=3306;database=GadgetHub;user=root;password=;";

            optionsBuilder.UseMySql(
                connectionString,
                new MySqlServerVersion(new Version(8, 0, 0))
            );

            return new GadgetHubDbContext(optionsBuilder.Options);
        }
    }
}
