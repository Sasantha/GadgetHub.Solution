using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using GadgetHub.API.Data;

namespace GadgetHub.API.Repositories
{
    public class Repository<T> : IRepository<T> where T : class
    {
        private readonly GadgetHubDbContext _context;
        private readonly DbSet<T> _dbSet;

        public Repository(GadgetHubDbContext context)
        {
            _context = context;
            _dbSet = context.Set<T>();
        }

        public async Task<T?> GetByIdAsync(string id)
        {
            return await _dbSet.FindAsync(id);
        }

        public async Task<IEnumerable<T>> GetAllAsync()
        {
            return await _dbSet.ToListAsync();
        }

        public async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate)
        {
            return await _dbSet.Where(predicate).ToListAsync();
        }

        public async Task<T> AddAsync(T entity)
        {
            await _dbSet.AddAsync(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task UpdateAsync(T entity)
        {
            // Detach any existing entity with the same key to avoid tracking conflicts
            var existingEntity = _context.ChangeTracker.Entries<T>()
                .FirstOrDefault(e => e.Entity.GetType().GetProperty("Id")?.GetValue(e.Entity)?.ToString() == 
                                   entity.GetType().GetProperty("Id")?.GetValue(entity)?.ToString());
            
            if (existingEntity != null)
            {
                existingEntity.State = EntityState.Detached;
            }
            
            _dbSet.Update(entity);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(string id)
        {
            var entity = await GetByIdAsync(id);
            if (entity != null)
            {
                _dbSet.Remove(entity);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> ExistsAsync(string id)
        {
            var entity = await GetByIdAsync(id);
            return entity != null;
        }

        public async Task<int> CountAsync()
        {
            return await _dbSet.CountAsync();
        }
    }
} 