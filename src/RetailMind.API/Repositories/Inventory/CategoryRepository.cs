using Microsoft.EntityFrameworkCore;
using RetailMind.API.Data;
using RetailMind.API.Models.Inventory;

namespace RetailMind.API.Repositories.Inventory;

public sealed class CategoryRepository : BaseRepository<Category>, ICategoryRepository
{
    public CategoryRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<Category>> GetRootCategoriesAsync(CancellationToken ct = default) =>
        await _dbSet
            .AsNoTracking()
            .Where(c => c.ParentId == null)
            .OrderBy(c => c.Name)
            .ToListAsync(ct);

    public async Task<IEnumerable<Category>> GetChildrenAsync(int parentId, CancellationToken ct = default) =>
        await _dbSet
            .AsNoTracking()
            .Where(c => c.ParentId == parentId)
            .OrderBy(c => c.Name)
            .ToListAsync(ct);

    public async Task<Category?> GetWithProductsAsync(int id, CancellationToken ct = default) =>
        await _dbSet
            .AsNoTracking()
            .Include(c => c.Products.Where(p => !p.IsDeleted))
                .ThenInclude(p => p.Inventory)
            .FirstOrDefaultAsync(c => c.Id == id, ct);

    public async Task<Category?> GetWithChildrenAsync(int id, CancellationToken ct = default) =>
        await _dbSet
            .AsNoTracking()
            .Include(c => c.Children)
            .Include(c => c.Parent)
            .FirstOrDefaultAsync(c => c.Id == id, ct);

    public async Task<IEnumerable<Category>> GetAllWithChildrenAsync(CancellationToken ct = default) =>
        await _dbSet
            .AsNoTracking()
            .Include(c => c.Children)
            .Where(c => c.ParentId == null)   // root nodes only; children come via navigation
            .OrderBy(c => c.Name)
            .ToListAsync(ct);

    public async Task<bool> HasChildrenAsync(int categoryId, CancellationToken ct = default) =>
        await _dbSet.AnyAsync(c => c.ParentId == categoryId, ct);

    public async Task<bool> HasProductsAsync(int categoryId, CancellationToken ct = default) =>
        await _context.Products.IgnoreQueryFilters()
            .AnyAsync(p => p.CategoryId == categoryId && !p.IsDeleted, ct);

    public async Task<bool> ExistsByNameAsync(
        string name, int? parentId, CancellationToken ct = default) =>
        await _dbSet.AnyAsync(c =>
            c.Name == name && c.ParentId == parentId, ct);
}
