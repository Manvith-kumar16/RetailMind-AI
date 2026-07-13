using RetailMind.API.Models.Inventory;

namespace RetailMind.API.Repositories.Inventory;

/// <summary>
/// Repository contract for Category hierarchy management.
/// </summary>
public interface ICategoryRepository : IRepository<Category>
{
    Task<IEnumerable<Category>> GetRootCategoriesAsync(CancellationToken ct = default);
    Task<IEnumerable<Category>> GetChildrenAsync(int parentId, CancellationToken ct = default);
    Task<Category?> GetWithProductsAsync(int id, CancellationToken ct = default);
    Task<Category?> GetWithChildrenAsync(int id, CancellationToken ct = default);
    Task<IEnumerable<Category>> GetAllWithChildrenAsync(CancellationToken ct = default);
    Task<bool> HasChildrenAsync(int categoryId, CancellationToken ct = default);
    Task<bool> HasProductsAsync(int categoryId, CancellationToken ct = default);
    Task<bool> ExistsByNameAsync(string name, int? parentId, CancellationToken ct = default);
}
