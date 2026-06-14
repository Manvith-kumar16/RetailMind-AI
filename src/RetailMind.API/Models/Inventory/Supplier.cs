namespace RetailMind.API.Models.Inventory;

/// <summary>
/// Represents a product supplier / vendor.
/// </summary>
public sealed class Supplier : BaseEntity
{
    public string  Name          { get; set; } = string.Empty;
    public string? Email         { get; set; }
    public string? Phone         { get; set; }
    public string? Address       { get; set; }
    public string? ContactPerson { get; set; }
    public string? Website       { get; set; }
    public string? Notes         { get; set; }
    public bool    IsActive      { get; set; } = true;

    // Navigation
    public ICollection<Product> Products { get; set; } = [];
}
