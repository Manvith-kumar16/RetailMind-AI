using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RetailMind.API.DTOs.Common;
using RetailMind.API.DTOs.Inventory;
using RetailMind.API.Models.Identity;
using RetailMind.API.Services.Inventory;

namespace RetailMind.API.Controllers;

/// <summary>
/// Products and stock management.
/// GET endpoints are accessible to all authenticated users.
/// Write operations require Manager or Admin role.
/// </summary>
[Route("api/v1/products")]
[Authorize]
public sealed class ProductsController : BaseController
{
    private readonly IInventoryService _service;

    public ProductsController(IInventoryService service) => _service = service;

    // ── Products ──────────────────────────────────────────────────────────────

    /// <summary>
    /// Get a paginated, filterable list of products.
    /// Supports search, category, supplier, and active-status filters.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<ProductSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProducts(
        [FromQuery] PaginationQuery query,
        [FromQuery] int?  categoryId = null,
        [FromQuery] int?  supplierId = null,
        [FromQuery] bool? isActive   = null,
        CancellationToken ct = default)
    {
        var result = await _service.GetProductsAsync(query, categoryId, supplierId, isActive, ct);
        return Ok(result);
    }

    /// <summary>Get a single product's full detail including stock info.</summary>
    [HttpGet("{id:int}", Name = "GetProduct")]
    [ProducesResponseType(typeof(ProductResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProduct(int id, CancellationToken ct)
    {
        var product = await _service.GetProductByIdAsync(id, ct);
        return Ok(product);
    }

    /// <summary>Look up a product by its SKU code.</summary>
    [HttpGet("by-sku/{sku}")]
    [ProducesResponseType(typeof(ProductResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetBySku(string sku, CancellationToken ct)
    {
        var product = await _service.GetProductBySkuAsync(sku, ct);
        return product is null
            ? NotFound($"No product found with SKU '{sku}'.")
            : Ok(product);
    }

    /// <summary>Create a new product with its initial stock record. Admin / Manager only.</summary>
    [HttpPost]
    [Authorize(Roles = $"{AppRoles.Admin},{AppRoles.Manager}")]
    [ProducesResponseType(typeof(ProductResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateProduct(
        [FromBody] CreateProductDto dto, CancellationToken ct)
    {
        var product = await _service.CreateProductAsync(dto, ct);
        return Created("GetProduct", new { id = product.Id }, product);
    }

    /// <summary>Update product details. Admin / Manager only.</summary>
    [HttpPut("{id:int}")]
    [Authorize(Roles = $"{AppRoles.Admin},{AppRoles.Manager}")]
    [ProducesResponseType(typeof(ProductResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateProduct(
        int id, [FromBody] UpdateProductDto dto, CancellationToken ct)
    {
        var product = await _service.UpdateProductAsync(id, dto, ct);
        return Ok(product, "Product updated.");
    }

    /// <summary>Soft-delete a product. Admin only.</summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = AppRoles.Admin)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteProduct(int id, CancellationToken ct)
    {
        await _service.DeleteProductAsync(id, ct);
        return NoContent();
    }

    // ── Stock / Inventory ─────────────────────────────────────────────────────

    /// <summary>Get current stock levels for a specific product.</summary>
    [HttpGet("{productId:int}/stock")]
    [ProducesResponseType(typeof(InventoryResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetStock(int productId, CancellationToken ct)
    {
        var inv = await _service.GetStockAsync(productId, ct);
        return Ok(inv);
    }

    /// <summary>
    /// Set absolute stock quantity for a product. Admin / Manager only.
    /// Use this for manual stock counts and receiving deliveries.
    /// </summary>
    [HttpPut("{productId:int}/stock")]
    [Authorize(Roles = $"{AppRoles.Admin},{AppRoles.Manager}")]
    [ProducesResponseType(typeof(InventoryResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SetStock(
        int productId, [FromBody] UpdateInventoryDto dto, CancellationToken ct)
    {
        var inv = await _service.SetStockAsync(productId, dto, ct);
        return Ok(inv, "Stock updated.");
    }

    /// <summary>
    /// Adjust stock by a positive or negative delta. Admin / Manager / Staff.
    /// Positive = receive stock. Negative = consume/write off.
    /// </summary>
    [HttpPatch("{productId:int}/stock/adjust")]
    [Authorize(Roles = $"{AppRoles.Admin},{AppRoles.Manager},{AppRoles.Staff}")]
    [ProducesResponseType(typeof(InventoryResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AdjustStock(
        int productId, [FromBody] AdjustStockDto dto, CancellationToken ct)
    {
        var inv = await _service.AdjustStockAsync(productId, dto, ct);
        return Ok(inv, $"Stock adjusted by {dto.Delta:+#;-#;0}. Reason: {dto.Reason}");
    }

    /// <summary>Get all products whose stock is at or below their reorder threshold.</summary>
    [HttpGet("low-stock")]
    [ProducesResponseType(typeof(IEnumerable<ProductSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLowStockAlerts(CancellationToken ct)
    {
        var alerts = await _service.GetLowStockAlertsAsync(ct);
        var list   = alerts.ToList();
        return Ok(list, $"{list.Count} product(s) below reorder threshold.");
    }
}
