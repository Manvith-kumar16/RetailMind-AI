namespace RetailMind.API.Models.Inventory;

/// <summary>
/// Product category / taxonomy node.
/// </summary>
public sealed class Category : BaseEntity
{
    public string  Name        { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int?    ParentId    { get; set; }    // supports nested categories

    // Navigation
    public Category?             Parent   { get; set; }
    public ICollection<Category> Children { get; set; } = [];
    public ICollection<Product>  Products { get; set; } = [];
}
