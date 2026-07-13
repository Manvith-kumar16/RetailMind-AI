using RetailMind.API.Models.Inventory;

namespace RetailMind.API.Repositories.Inventory;

/// <summary>
/// Repository contract for Supplier CRUD and look-up operations.
/// </summary>
public interface ISupplierRepository : IRepository<Supplier>
{
    Task<Supplier?> GetByNameAsync(string name, CancellationToken ct = default);
    Task<Supplier?> GetWithProductsAsync(int id, CancellationToken ct = default);
    Task<IEnumerable<Supplier>> GetActiveAsync(CancellationToken ct = default);
    Task<(IEnumerable<Supplier> Items, int Total)> GetPagedAsync(
        int page, int pageSize, string? search = null, CancellationToken ct = default);
    Task<bool> HasProductsAsync(int supplierId, CancellationToken ct = default);
}
