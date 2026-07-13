using RetailMind.API.DTOs.Common;
using RetailMind.API.DTOs.Inventory;

namespace RetailMind.API.Services.Inventory;

/// <summary>
/// Business logic contract for Category management.
/// </summary>
public interface ICategoryService
{
    Task<IEnumerable<CategoryResponseDto>> GetAllAsync(CancellationToken ct = default);
    Task<IEnumerable<CategoryTreeDto>>     GetTreeAsync(CancellationToken ct = default);
    Task<CategoryResponseDto>              GetByIdAsync(int id, CancellationToken ct = default);
    Task<CategoryResponseDto>              CreateAsync(CreateCategoryDto dto, CancellationToken ct = default);
    Task<CategoryResponseDto>              UpdateAsync(int id, UpdateCategoryDto dto, CancellationToken ct = default);
    Task                                   DeleteAsync(int id, CancellationToken ct = default);
    Task<IEnumerable<ProductSummaryDto>>   GetCategoryProductsAsync(int categoryId, CancellationToken ct = default);
}
