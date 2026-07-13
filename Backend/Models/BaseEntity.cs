namespace RetailMind.API.Models;

/// <summary>
/// Base entity that all domain entities inherit from.
/// Provides common audit fields.
/// </summary>
public abstract class BaseEntity
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsDeleted { get; set; } = false;     // soft-delete flag
}
