using RetailMind.API.Data;
using RetailMind.API.DTOs.Common;
using RetailMind.API.DTOs.Inventory;
using RetailMind.API.Models.Inventory;
using RetailMind.API.Repositories.Inventory;

namespace RetailMind.API.Services.Inventory;

public sealed class CategoryService : ICategoryService
{
    private readonly ICategoryRepository      _repo;
    private readonly IInventoryRepository     _productRepo;
    private readonly ILogger<CategoryService> _logger;

    public CategoryService(
        ICategoryRepository       repo,
        IInventoryRepository      productRepo,
        ILogger<CategoryService>  logger)
    {
        _repo        = repo;
        _productRepo = productRepo;
        _logger      = logger;
    }

    public async Task<IEnumerable<CategoryResponseDto>> GetAllAsync(
        CancellationToken ct = default)
    {
        var categories = await _repo.GetAllAsync(ct);
        var tasks = categories.Select(async c =>
        {
            var productCount = await _repo.HasProductsAsync(c.Id, ct);
            return ToResponseDto(c, productCount ? 1 : 0, 0); // counts are approximate for list view
        });
        var results = await System.Threading.Tasks.Task.WhenAll(tasks);
        return results;
    }

    public async Task<IEnumerable<CategoryTreeDto>> GetTreeAsync(
        CancellationToken ct = default)
    {
        var roots = await _repo.GetAllWithChildrenAsync(ct);
        return roots.Select(BuildTree);
    }

    public async Task<CategoryResponseDto> GetByIdAsync(
        int id, CancellationToken ct = default)
    {
        var category = await _repo.GetWithChildrenAsync(id, ct)
            ?? throw new KeyNotFoundException($"Category with ID {id} was not found.");

        var productCount = await _repo.HasProductsAsync(id, ct) ? 1 : 0; // flag, not exact count here
        return ToResponseDto(category, productCount, category.Children.Count);
    }

    public async Task<CategoryResponseDto> CreateAsync(
        CreateCategoryDto dto, CancellationToken ct = default)
    {
        // Guard: parent must exist
        if (dto.ParentId.HasValue)
        {
            if (!await _repo.ExistsAsync(c => c.Id == dto.ParentId.Value, ct))
                throw new InvalidOperationException(
                    $"Parent category with ID {dto.ParentId} does not exist.");
        }

        // Guard: name must be unique within same parent level
        if (await _repo.ExistsByNameAsync(dto.Name.Trim(), dto.ParentId, ct))
            throw new InvalidOperationException(
                $"A category named '{dto.Name}' already exists at this level.");

        var category = new Category
        {
            Name        = dto.Name.Trim(),
            Description = dto.Description?.Trim(),
            ParentId    = dto.ParentId
        };

        var created = await _repo.AddAsync(category, ct);
        _logger.LogInformation(
            "Category created. Id: {CategoryId} Name: '{Name}'", created.Id, created.Name);

        return ToResponseDto(created, 0, 0);
    }

    public async Task<CategoryResponseDto> UpdateAsync(
        int id, UpdateCategoryDto dto, CancellationToken ct = default)
    {
        var category = await _repo.GetWithChildrenAsync(id, ct)
            ?? throw new KeyNotFoundException($"Category with ID {id} was not found.");

        // Guard: cannot make a category its own parent
        if (dto.ParentId.HasValue && dto.ParentId.Value == id)
            throw new InvalidOperationException("A category cannot be its own parent.");

        // Guard: parent must exist
        if (dto.ParentId.HasValue)
        {
            if (!await _repo.ExistsAsync(c => c.Id == dto.ParentId.Value, ct))
                throw new InvalidOperationException(
                    $"Parent category with ID {dto.ParentId} does not exist.");
        }

        if (dto.Name        is not null) category.Name        = dto.Name.Trim();
        if (dto.Description is not null) category.Description = dto.Description.Trim();
        if (dto.ParentId    is not null) category.ParentId    = dto.ParentId;

        category.UpdatedAt = DateTime.UtcNow;
        await _repo.UpdateAsync(category, ct);

        _logger.LogInformation("Category updated. Id: {CategoryId}", id);
        return ToResponseDto(category, 0, category.Children.Count);
    }

    public async Task DeleteAsync(int id, CancellationToken ct = default)
    {
        var category = await _repo.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException($"Category with ID {id} was not found.");

        // Guard: has sub-categories
        if (await _repo.HasChildrenAsync(id, ct))
            throw new InvalidOperationException(
                "Cannot delete a category that has sub-categories. Remove them first.");

        // Guard: has products
        if (await _repo.HasProductsAsync(id, ct))
            throw new InvalidOperationException(
                "Cannot delete a category that has products. Reassign them first.");

        category.IsDeleted = true;
        category.UpdatedAt = DateTime.UtcNow;
        await _repo.UpdateAsync(category, ct);

        _logger.LogInformation("Category soft-deleted. Id: {CategoryId}", id);
    }

    public async Task<IEnumerable<ProductSummaryDto>> GetCategoryProductsAsync(
        int categoryId, CancellationToken ct = default)
    {
        if (!await _repo.ExistsAsync(c => c.Id == categoryId, ct))
            throw new KeyNotFoundException($"Category with ID {categoryId} was not found.");

        var products = await _productRepo.GetByCategoryAsync(categoryId, ct);
        return products.Select(p => new ProductSummaryDto(
            p.Id, p.Name, p.SKU, p.Price, p.IsActive,
            p.Category?.Name ?? string.Empty,
            p.Inventory?.QuantityOnHand,
            p.Inventory?.IsLowStock ?? false));
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private static CategoryResponseDto ToResponseDto(
        Category c, int productCount, int childCount) =>
        new(c.Id, c.Name, c.Description, c.ParentId,
            c.Parent?.Name, productCount, childCount, c.CreatedAt);

    private static CategoryTreeDto BuildTree(Category c) =>
        new(c.Id, c.Name, c.Description,
            c.Children.OrderBy(ch => ch.Name).Select(BuildTree));
}
