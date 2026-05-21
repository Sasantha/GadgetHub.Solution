using GadgetHub.API.Models;
using GadgetHub.API.Repositories;

namespace GadgetHub.API.Services
{
    public class ProductService : IProductService
    {
        private readonly IRepository<Product> _productRepository;

        public ProductService(IRepository<Product> productRepository)
        {
            _productRepository = productRepository;
        }

        public async Task<IEnumerable<Product>> GetAllProductsAsync()
        {
            return await _productRepository.GetAllAsync();
        }

        public async Task<Product?> GetProductByIdAsync(string id)
        {
            return await _productRepository.GetByIdAsync(id);
        }

        public async Task<IEnumerable<Product>> GetProductsByCategoryAsync(string category)
        {
            return await _productRepository.FindAsync(p => p.Category == category);
        }

        public async Task<IEnumerable<Product>> SearchProductsAsync(string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
                return await GetAllProductsAsync();

            return await _productRepository.FindAsync(p => 
                p.Name.Contains(searchTerm) || 
                p.Description!.Contains(searchTerm) ||
                p.Brand!.Contains(searchTerm));
        }

        public async Task<Product> CreateProductAsync(Product product)
        {
            product.Id = Guid.NewGuid().ToString();
            product.CreatedAt = DateTime.UtcNow;
            return await _productRepository.AddAsync(product);
        }

        public async Task UpdateProductAsync(Product product)
        {
            await _productRepository.UpdateAsync(product);
        }

        public async Task DeleteProductAsync(string id)
        {
            await _productRepository.DeleteAsync(id);
        }

        public async Task<IEnumerable<string>> GetCategoriesAsync()
        {
            var products = await _productRepository.GetAllAsync();
            return products.Where(p => !string.IsNullOrWhiteSpace(p.Category))
                          .Select(p => p.Category!)
                          .Distinct()
                          .OrderBy(c => c);
        }
    }
} 