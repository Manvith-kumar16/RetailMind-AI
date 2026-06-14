using Microsoft.EntityFrameworkCore;
using RetailMind.API.Data;
using RetailMind.API.Models.Inventory;

namespace RetailMind.API.Repositories.Inventory;

public sealed class SupplierRepository : BaseRepository<Supplier>, ISupplierRepository
{
    public SupplierRepository(AppDbContext context) : base(context) { }

    public async Task<Supplier?> GetByNameAsync(string name, CancellationToken ct = default) =>
        await _dbSet
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Name == name, ct);

    public async Task<Supplier?> GetWithProductsAsync(int id, CancellationToken ct = default) =>
        await _dbSet
            .AsNoTracking()
            .Include(s => s.Products.Where(p => !p.IsDeleted))
            .FirstOrDefaultAsync(s => s.Id == id, ct);

    public async Task<IEnumerable<Supplier>> GetActiveAsync(CancellationToken ct = default) =>
        await _dbSet
            .AsNoTracking()
            .Where(s => s.IsActive)
            .OrderBy(s => s.Name)
            .ToListAsync(ct);

    public async Task<(IEnumerable<Supplier> Items, int Total)> GetPagedAsync(
        int page, int pageSize, string? search = null, CancellationToken ct = default)
    {
        var query = _dbSet.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(s =>
                s.Name.Contains(search) ||
                (s.Email != null && s.Email.Contains(search)) ||
                (s.ContactPerson != null && s.ContactPerson.Contains(search)));

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderBy(s => s.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, total);
    }

    public async Task<bool> HasProductsAsync(int supplierId, CancellationToken ct = default) =>
        await _context.Products.IgnoreQueryFilters()
            .AnyAsync(p => p.SupplierId == supplierId && !p.IsDeleted, ct);
}
