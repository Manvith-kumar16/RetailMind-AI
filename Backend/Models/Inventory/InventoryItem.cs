namespace RetailMind.API.Models.Inventory;

/// <summary>
/// Tracks stock levels for a product at a specific location.
/// </summary>
public sealed class InventoryItem : BaseEntity
{
    public int     ProductId      { get; set; }
    public int     QuantityOnHand { get; set; }
    public int     ReorderLevel   { get; set; } = 10;
    public int     ReorderQuantity { get; set; } = 50;
    public string? WarehouseLocation { get; set; }
    public DateTime LastStockCheck  { get; set; } = DateTime.UtcNow;

    public bool IsLowStock => QuantityOnHand <= ReorderLevel;

    // Navigation
    public Product Product { get; set; } = null!;
}
