namespace RetailMind.API.Models.Identity;

/// <summary>
/// Stores JWT refresh tokens for persistent authentication sessions.
/// </summary>
public sealed class RefreshToken
{
    public int    Id          { get; set; }
    public string Token       { get; set; } = string.Empty;
    public string UserId      { get; set; } = string.Empty;
    public DateTime Expires   { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsRevoked     { get; set; } = false;
    public string? ReplacedByToken { get; set; }
    public string? CreatedByIp { get; set; }
    public string? RevokedByIp { get; set; }

    public bool IsExpired  => DateTime.UtcNow >= Expires;
    public bool IsActive   => !IsRevoked && !IsExpired;

    // Navigation
    public ApplicationUser User { get; set; } = null!;
}
