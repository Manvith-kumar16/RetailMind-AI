using Microsoft.AspNetCore.Identity;

namespace RetailMind.API.Models.Identity;

/// <summary>
/// Extends ASP.NET Core Identity user with domain-specific fields.
/// </summary>
public sealed class ApplicationUser : IdentityUser
{
    public string FirstName  { get; set; } = string.Empty;
    public string LastName   { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation
    public ICollection<RefreshToken> RefreshTokens { get; set; } = [];
}
