using RetailMind.API.DTOs.Common;
using RetailMind.API.DTOs.Inventory;

namespace RetailMind.API.Services.Inventory;

/// <summary>
/// Business logic contract for Supplier management.
/// </summary>
public interface ISupplierService
{
    Task<PagedResponse<SupplierResponseDto>> GetAllAsync(PaginationQuery query, CancellationToken ct = default);
    Task<IEnumerable<SupplierSummaryDto>>    GetActiveSummariesAsync(CancellationToken ct = default);
    Task<SupplierResponseDto>                GetByIdAsync(int id, CancellationToken ct = default);
    Task<SupplierResponseDto>                CreateAsync(CreateSupplierDto dto, CancellationToken ct = default);
    Task<SupplierResponseDto>                UpdateAsync(int id, UpdateSupplierDto dto, CancellationToken ct = default);
    Task                                     DeleteAsync(int id, CancellationToken ct = default);
    Task<IEnumerable<ProductSummaryDto>>     GetSupplierProductsAsync(int supplierId, CancellationToken ct = default);
}
