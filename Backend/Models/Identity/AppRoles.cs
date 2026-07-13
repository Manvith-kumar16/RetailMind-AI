namespace RetailMind.API.Models.Identity;

/// <summary>
/// Centralised role name constants — prevents magic strings scattered across the codebase.
/// </summary>
public static class AppRoles
{
    public const string Admin   = "Admin";
    public const string Manager = "Manager";
    public const string Staff   = "Staff";
    public const string Vendor  = "Vendor";

    /// <summary>All roles in the system — used for seeding.</summary>
    public static readonly IReadOnlyList<string> All = [Admin, Manager, Staff, Vendor];
}
