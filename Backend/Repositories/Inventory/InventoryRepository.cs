using Microsoft.EntityFrameworkCore;
using RetailMind.API.Data;
using RetailMind.API.Models.Inventory;

namespace RetailMind.API.Repositories.Inventory;

public sealed class InventoryRepository : BaseRepository<Product>, IInventoryRepository
{
    public InventoryRepository(AppDbContext context) : base(context) { }

    // ── Product queries ────────────────────────────────────────────────────────

    public async Task<Product?> GetBySkuAsync(string sku, CancellationToken ct = default) =>
        await _dbSet
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Supplier)
            .Include(p => p.Inventory)
            .FirstOrDefaultAsync(p => p.SKU == sku, ct);

    public async Task<Product?> GetByIdWithDetailsAsync(int id, CancellationToken ct = default) =>
        await _dbSet
            .AsNoTracking()
            .Include(p => p.Category)
                .ThenInclude(c => c.Parent)
            .Include(p => p.Supplier)
            .Include(p => p.Inventory)
            .FirstOrDefaultAsync(p => p.Id == id, ct);

    public async Task<IEnumerable<Product>> GetWithInventoryAsync(CancellationToken ct = default) =>
        await _dbSet
            .AsNoTracking()
            .Include(p => p.Inventory)
            .Include(p => p.Category)
            .OrderBy(p => p.Name)
            .ToListAsync(ct);

    public async Task<IEnumerable<Product>> GetLowStockProductsAsync(CancellationToken ct = default) =>
        await _dbSet
            .AsNoTracking()
            .Include(p => p.Inventory)
            .Include(p => p.Category)
            .Include(p => p.Supplier)
            .Where(p => p.Inventory != null &&
                        p.Inventory.QuantityOnHand <= p.Inventory.ReorderLevel)
            .OrderBy(p => p.Inventory!.QuantityOnHand)
            .ToListAsync(ct);

    public async Task<IEnumerable<Product>> GetByCategoryAsync(
        int categoryId, CancellationToken ct = default) =>
        await _dbSet
            .AsNoTracking()
            .Include(p => p.Inventory)
            .Include(p => p.Category)
            .Where(p => p.CategoryId == categoryId)
            .OrderBy(p => p.Name)
            .ToListAsync(ct);

    public async Task<IEnumerable<Product>> GetBySupplierAsync(
        int supplierId, CancellationToken ct = default) =>
        await _dbSet
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Inventory)
            .Where(p => p.SupplierId == supplierId)
            .OrderBy(p => p.Name)
            .ToListAsync(ct);

    public async Task<(IEnumerable<Product> Items, int Total)> GetPagedAsync(
        int page, int pageSize,
        string? search    = null,
        int?    categoryId = null,
        int?    supplierId = null,
        bool?   isActive   = null,
        CancellationToken ct = default)
    {
        var query = _dbSet
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Supplier)
            .Include(p => p.Inventory)
            .AsQueryable();

        // ── Filters ───────────────────────────────────────────────────────────
        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(p =>
                p.Name.Contains(search) ||
                p.SKU.Contains(search)  ||
                (p.Description != null && p.Description.Contains(search)));

        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryId == categoryId.Value);

        if (supplierId.HasValue)
            query = query.Where(p => p.SupplierId == supplierId.Value);

        if (isActive.HasValue)
            query = query.Where(p => p.IsActive == isActive.Value);

        // ── Count before pagination ───────────────────────────────────────────
        var total = await query.CountAsync(ct);

        // ── Paginate ──────────────────────────────────────────────────────────
        var items = await query
            .OrderBy(p => p.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, total);
    }

    // ── Inventory (stock) operations ──────────────────────────────────────────

    public async Task<InventoryItem?> GetInventoryByProductAsync(
        int productId, CancellationToken ct = default) =>
        await _context.Inventories
            .AsNoTracking()
            .Include(i => i.Product)
            .FirstOrDefaultAsync(i => i.ProductId == productId, ct);

    public async Task<InventoryItem> AdjustStockAsync(
        int productId, int delta, CancellationToken ct = default)
    {
        var inv = await _context.Inventories
            .FirstOrDefaultAsync(i => i.ProductId == productId, ct)
            ?? throw new KeyNotFoundException(
                $"Inventory record for product {productId} not found.");

        var newQty = inv.QuantityOnHand + delta;
        if (newQty < 0)
            throw new InvalidOperationException(
                $"Insufficient stock. Available: {inv.QuantityOnHand}, Requested: {Math.Abs(delta)}.");

        inv.QuantityOnHand = newQty;
        inv.LastStockCheck = DateTime.UtcNow;
        inv.UpdatedAt      = DateTime.UtcNow;

        _context.Inventories.Update(inv);
        await _context.SaveChangesAsync(ct);

        return inv;
    }
}
