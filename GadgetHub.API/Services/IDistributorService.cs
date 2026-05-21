using GadgetHub.API.Models;

namespace GadgetHub.API.Services
{
    public interface IDistributorService
    {
        Task<IEnumerable<Distributor>> GetAllDistributorsAsync();
        Task<Distributor?> GetDistributorByIdAsync(string id);
        Task<Distributor?> GetDistributorByTypeAsync(string type);
        Task<IEnumerable<Distributor>> GetActiveDistributorsAsync();
        Task<Distributor> CreateDistributorAsync(Distributor distributor);
        Task UpdateDistributorAsync(Distributor distributor);
        Task DeleteDistributorAsync(string id);
    }
} 