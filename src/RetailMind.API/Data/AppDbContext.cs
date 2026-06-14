using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using RetailMind.API.Models.Identity;
using RetailMind.API.Models.Inventory;
using RetailMind.API.Models.Orders;
using RetailMind.API.Models.Employees;

namespace RetailMind.API.Data;

/// <summary>
/// Main application database context.
/// Inherits from IdentityDbContext to include ASP.NET Identity tables.
/// </summary>
public sealed class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // ── Inventory ────────────────────────────────────────────────────────────
    public DbSet<Product>   Products   { get; set; } = null!;
    public DbSet<InventoryItem> Inventories { get; set; } = null!;
    public DbSet<Supplier>  Suppliers  { get; set; } = null!;
    public DbSet<Category>  Categories { get; set; } = null!;

    // ── Orders ───────────────────────────────────────────────────────────────
    public DbSet<Order>     Orders     { get; set; } = null!;
    public DbSet<OrderItem> OrderItems { get; set; } = null!;

    // ── Employees ────────────────────────────────────────────────────────────
    public DbSet<Employee>  Employees  { get; set; } = null!;
    public DbSet<WorkLog>   WorkLogs   { get; set; } = null!;

    // ── Auth / Tokens ────────────────────────────────────────────────────────
    public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // ── Rename ASP.NET Identity tables to snake_case ───────────────────────
        builder.Entity<ApplicationUser>()
            .ToTable("users")
            .Property(u => u.FirstName).HasMaxLength(50).IsRequired();
        builder.Entity<ApplicationUser>()
            .Property(u => u.LastName).HasMaxLength(50).IsRequired();
        builder.Entity<ApplicationUser>()
            .Property(u => u.AvatarUrl).HasMaxLength(500);

        builder.Entity<IdentityRole>()
            .ToTable("roles");
        builder.Entity<IdentityUserRole<string>>()
            .ToTable("user_roles");
        builder.Entity<IdentityUserClaim<string>>()
            .ToTable("user_claims");
        builder.Entity<IdentityUserLogin<string>>()
            .ToTable("user_logins");
        builder.Entity<IdentityUserToken<string>>()
            .ToTable("user_tokens");
        builder.Entity<IdentityRoleClaim<string>>()
            .ToTable("role_claims");

        // Apply all IEntityTypeConfiguration<T> classes in this assembly
        builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured) return;

        optionsBuilder
            .UseSnakeCaseNamingConvention()        // maps PascalCase → snake_case columns
            .EnableSensitiveDataLogging(false)     // never log params in production
            .EnableDetailedErrors();
    }
}
