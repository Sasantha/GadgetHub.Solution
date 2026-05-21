using GadgetHub.API.Models;
using GadgetHub.API.Repositories;

namespace GadgetHub.API.Services
{
    public class DistributorService : IDistributorService
    {
        private readonly IRepository<Distributor> _distributorRepository;

        public DistributorService(IRepository<Distributor> distributorRepository)
        {
            _distributorRepository = distributorRepository;
        }

        public async Task<IEnumerable<Distributor>> GetAllDistributorsAsync()
        {
            return await _distributorRepository.GetAllAsync();
        }

        public async Task<Distributor?> GetDistributorByIdAsync(string id)
        {
            return await _distributorRepository.GetByIdAsync(id);
        }

        public async Task<Distributor?> GetDistributorByTypeAsync(string type)
        {
            var distributors = await _distributorRepository.FindAsync(d => d.Type == type);
            return distributors.FirstOrDefault();
        }

        public async Task<IEnumerable<Distributor>> GetActiveDistributorsAsync()
        {
            // For now, return all distributors since we don't have IsActive field
            // In a real system, you'd filter by IsActive = true
            return await _distributorRepository.GetAllAsync();
        }

        public async Task<Distributor> CreateDistributorAsync(Distributor distributor)
        {
            distributor.Id = Guid.NewGuid().ToString();
            distributor.CreatedAt = DateTime.UtcNow;
            return await _distributorRepository.AddAsync(distributor);
        }

        public async Task UpdateDistributorAsync(Distributor distributor)
        {
            await _distributorRepository.UpdateAsync(distributor);
        }

        public async Task DeleteDistributorAsync(string id)
        {
            await _distributorRepository.DeleteAsync(id);
        }
    }
} 