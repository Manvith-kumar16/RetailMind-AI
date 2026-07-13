namespace RetailMind.API.Models.Orders;

/// <summary>
/// Represents a customer or internal purchase order.
/// </summary>
public sealed class Order : BaseEntity
{
    public string    OrderNumber  { get; set; } = string.Empty;
    public string    CustomerId   { get; set; } = string.Empty;   // FK to ApplicationUser
    public OrderStatus Status     { get; set; } = OrderStatus.Pending;
    public OrderType   Type       { get; set; } = OrderType.Standard;
    public decimal     TotalAmount { get; set; }
    public string?     Notes      { get; set; }
    public DateTime?   ScheduledAt { get; set; }    // for pre-orders
    public DateTime?   ShippedAt   { get; set; }
    public DateTime?   DeliveredAt { get; set; }

    // Navigation
    public ICollection<OrderItem> Items { get; set; } = [];
}

public enum OrderStatus
{
    Pending   = 0,
    Confirmed = 1,
    Processing = 2,
    Shipped   = 3,
    Delivered = 4,
    Cancelled = 5,
    Refunded  = 6
}

public enum OrderType
{
    Standard = 0,
    PreOrder = 1,
    Bulk     = 2
}
