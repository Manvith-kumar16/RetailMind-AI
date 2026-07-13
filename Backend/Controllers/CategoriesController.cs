using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RetailMind.API.DTOs.Inventory;
using RetailMind.API.Models.Identity;
using RetailMind.API.Services.Inventory;

namespace RetailMind.API.Controllers;

/// <summary>
/// Product category (taxonomy) management.
/// Read access: all authenticated users.
/// Write access: Admin and Manager.
/// </summary>
[Route("api/v1/categories")]
[Authorize]
public sealed class CategoriesController : BaseController
{
    private readonly ICategoryService _service;

    public CategoriesController(ICategoryService service) => _service = service;

    /// <summary>Get all categories as a flat list.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<CategoryResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCategories(CancellationToken ct)
    {
        var result = await _service.GetAllAsync(ct);
        return Ok(result);
    }

    /// <summary>
    /// Get the full category tree (root nodes with nested children).
    /// Ideal for sidebar navigation and category pickers.
    /// </summary>
    [HttpGet("tree")]
    [ProducesResponseType(typeof(IEnumerable<CategoryTreeDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCategoryTree(CancellationToken ct)
    {
        var tree = await _service.GetTreeAsync(ct);
        return Ok(tree);
    }

    /// <summary>Get a single category with its parent and children.</summary>
    [HttpGet("{id:int}", Name = "GetCategory")]
    [ProducesResponseType(typeof(CategoryResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCategory(int id, CancellationToken ct)
    {
        var category = await _service.GetByIdAsync(id, ct);
        return Ok(category);
    }

    /// <summary>Get all products in a category.</summary>
    [HttpGet("{id:int}/products")]
    [ProducesResponseType(typeof(IEnumerable<ProductSummaryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCategoryProducts(int id, CancellationToken ct)
    {
        var products = await _service.GetCategoryProductsAsync(id, ct);
        return Ok(products);
    }

    /// <summary>Create a new category or sub-category. Admin / Manager only.</summary>
    [HttpPost]
    [Authorize(Roles = $"{AppRoles.Admin},{AppRoles.Manager}")]
    [ProducesResponseType(typeof(CategoryResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateCategory(
        [FromBody] CreateCategoryDto dto, CancellationToken ct)
    {
        var category = await _service.CreateAsync(dto, ct);
        return Created("GetCategory", new { id = category.Id }, category);
    }

    /// <summary>Update a category. Admin / Manager only.</summary>
    [HttpPut("{id:int}")]
    [Authorize(Roles = $"{AppRoles.Admin},{AppRoles.Manager}")]
    [ProducesResponseType(typeof(CategoryResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateCategory(
        int id, [FromBody] UpdateCategoryDto dto, CancellationToken ct)
    {
        var category = await _service.UpdateAsync(id, dto, ct);
        return Ok(category, "Category updated.");
    }

    /// <summary>
    /// Soft-delete a category. Admin only.
    /// Will fail if the category has sub-categories or assigned products.
    /// </summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = AppRoles.Admin)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteCategory(int id, CancellationToken ct)
    {
        await _service.DeleteAsync(id, ct);
        return NoContent();
    }
}
