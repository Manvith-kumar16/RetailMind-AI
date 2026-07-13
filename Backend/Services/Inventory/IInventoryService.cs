using RetailMind.API.DTOs.Common;
using RetailMind.API.DTOs.Inventory;

namespace RetailMind.API.Services.Inventory;

/// <summary>
/// Business logic contract for Product and Inventory management.
/// </summary>
public interface IInventoryService
{
    // ── Products ──────────────────────────────────────────────────────────────
    Task<PagedResponse<ProductSummaryDto>> GetProductsAsync(
        PaginationQuery query,
        int? categoryId = null, int? supplierId = null, bool? isActive = null,
        CancellationToken ct = default);

    Task<ProductResponseDto> GetProductByIdAsync(int id, CancellationToken ct = default);
    Task<ProductResponseDto?> GetProductBySkuAsync(string sku, CancellationToken ct = default);
    Task<ProductResponseDto> CreateProductAsync(CreateProductDto dto, CancellationToken ct = default);
    Task<ProductResponseDto> UpdateProductAsync(int id, UpdateProductDto dto, CancellationToken ct = default);
    Task DeleteProductAsync(int id, CancellationToken ct = default);

    // ── Stock / Inventory ─────────────────────────────────────────────────────
    Task<IEnumerable<ProductSummaryDto>> GetLowStockAlertsAsync(CancellationToken ct = default);
    Task<InventoryResponseDto> GetStockAsync(int productId, CancellationToken ct = default);
    Task<InventoryResponseDto> SetStockAsync(int productId, UpdateInventoryDto dto, CancellationToken ct = default);
    Task<InventoryResponseDto> AdjustStockAsync(int productId, AdjustStockDto dto, CancellationToken ct = default);
}
