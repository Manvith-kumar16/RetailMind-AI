using RetailMind.API.Models.Inventory;

namespace RetailMind.API.Repositories.Inventory;

/// <summary>
/// Repository contract for Product and Inventory queries.
/// </summary>
public interface IInventoryRepository : IRepository<Product>
{
    // ── Product queries ───────────────────────────────────────────────────────
    Task<Product?> GetBySkuAsync(string sku, CancellationToken ct = default);
    Task<Product?> GetByIdWithDetailsAsync(int id, CancellationToken ct = default);
    Task<IEnumerable<Product>> GetWithInventoryAsync(CancellationToken ct = default);
    Task<IEnumerable<Product>> GetLowStockProductsAsync(CancellationToken ct = default);
    Task<IEnumerable<Product>> GetByCategoryAsync(int categoryId, CancellationToken ct = default);
    Task<IEnumerable<Product>> GetBySupplierAsync(int supplierId, CancellationToken ct = default);
    Task<(IEnumerable<Product> Items, int Total)> GetPagedAsync(
        int page, int pageSize, string? search = null,
        int? categoryId = null, int? supplierId = null, bool? isActive = null,
        CancellationToken ct = default);

    // ── Inventory (stock) operations ─────────────────────────────────────────
    Task<InventoryItem?> GetInventoryByProductAsync(int productId, CancellationToken ct = default);
    Task<InventoryItem>  AdjustStockAsync(int productId, int delta, CancellationToken ct = default);
}
