using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RetailMind.API.DTOs.Common;
using RetailMind.API.DTOs.Inventory;
using RetailMind.API.Models.Identity;
using RetailMind.API.Services.Inventory;

namespace RetailMind.API.Controllers;

/// <summary>
/// Supplier (vendor) management.
/// Read access: all authenticated users.
/// Write access: Admin and Manager only.
/// </summary>
[Route("api/v1/suppliers")]
[Authorize]
public sealed class SuppliersController : BaseController
{
    private readonly ISupplierService _service;

    public SuppliersController(ISupplierService service) => _service = service;

    /// <summary>Get paginated list of suppliers with optional name/email/contact search.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<SupplierResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSuppliers(
        [FromQuery] PaginationQuery query, CancellationToken ct)
    {
        var result = await _service.GetAllAsync(query, ct);
        return Ok(result);
    }

    /// <summary>Get active suppliers as a summary list for UI dropdowns.</summary>
    [HttpGet("active")]
    [ProducesResponseType(typeof(IEnumerable<SupplierSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetActiveSummaries(CancellationToken ct)
    {
        var result = await _service.GetActiveSummariesAsync(ct);
        return Ok(result);
    }

    /// <summary>Get a single supplier with full details and their product list.</summary>
    [HttpGet("{id:int}", Name = "GetSupplier")]
    [ProducesResponseType(typeof(SupplierResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSupplier(int id, CancellationToken ct)
    {
        var supplier = await _service.GetByIdAsync(id, ct);
        return Ok(supplier);
    }

    /// <summary>Get all active products belonging to a supplier.</summary>
    [HttpGet("{id:int}/products")]
    [ProducesResponseType(typeof(IEnumerable<ProductSummaryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSupplierProducts(int id, CancellationToken ct)
    {
        var products = await _service.GetSupplierProductsAsync(id, ct);
        return Ok(products);
    }

    /// <summary>Create a new supplier. Admin / Manager only.</summary>
    [HttpPost]
    [Authorize(Roles = $"{AppRoles.Admin},{AppRoles.Manager}")]
    [ProducesResponseType(typeof(SupplierResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateSupplier(
        [FromBody] CreateSupplierDto dto, CancellationToken ct)
    {
        var supplier = await _service.CreateAsync(dto, ct);
        return Created("GetSupplier", new { id = supplier.Id }, supplier);
    }

    /// <summary>Update supplier details. Admin / Manager only.</summary>
    [HttpPut("{id:int}")]
    [Authorize(Roles = $"{AppRoles.Admin},{AppRoles.Manager}")]
    [ProducesResponseType(typeof(SupplierResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateSupplier(
        int id, [FromBody] UpdateSupplierDto dto, CancellationToken ct)
    {
        var supplier = await _service.UpdateAsync(id, dto, ct);
        return Ok(supplier, "Supplier updated.");
    }

    /// <summary>
    /// Soft-delete a supplier. Admin only.
    /// Will fail if the supplier has active products — reassign them first.
    /// </summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = AppRoles.Admin)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteSupplier(int id, CancellationToken ct)
    {
        await _service.DeleteAsync(id, ct);
        return NoContent();
    }
}
