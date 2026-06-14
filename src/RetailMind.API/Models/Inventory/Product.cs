namespace RetailMind.API.Models.Inventory;

/// <summary>
/// Represents a product in the retail catalog.
/// </summary>
public sealed class Product : BaseEntity
{
    public string  Name        { get; set; } = string.Empty;
    public string  SKU         { get; set; } = string.Empty;          // Stock Keeping Unit
    public string? Description { get; set; }
    public decimal Price       { get; set; }
    public decimal CostPrice   { get; set; }
    public string? ImageUrl    { get; set; }
    public bool    IsActive    { get; set; } = true;

    // Foreign keys
    public int  CategoryId { get; set; }
    public int? SupplierId { get; set; }

    // Navigation
    public Category  Category  { get; set; } = null!;
    public Supplier? Supplier  { get; set; }
    public InventoryItem? Inventory { get; set; }
}
