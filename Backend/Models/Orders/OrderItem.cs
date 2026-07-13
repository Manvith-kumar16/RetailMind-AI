using RetailMind.API.Models.Inventory;

namespace RetailMind.API.Models.Orders;

/// <summary>
/// A single line item within an order.
/// Unit price and product name are snapshotted at order time — price changes
/// after placement must NOT affect existing orders.
/// </summary>
public sealed class OrderItem : BaseEntity
{
    public int     OrderId      { get; set; }
    public int     ProductId    { get; set; }
    public string  ProductName  { get; set; } = string.Empty;   // snapshot at order time
    public int     Quantity     { get; set; }
    public decimal UnitPrice    { get; set; }    // snapshot at order time
    public decimal Discount     { get; set; } = 0;

    // Computed — not stored
    public decimal LineTotal => Math.Round((UnitPrice - Discount) * Quantity, 2);

    // Navigation
    public Order   Order   { get; set; } = null!;
    public Product Product { get; set; } = null!;
}
