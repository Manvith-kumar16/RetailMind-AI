using Microsoft.AspNetCore.Identity;
using RetailMind.API.Models.Identity;

namespace RetailMind.API.Data.Seeders;

/// <summary>
/// Seeds application roles and the default admin account into the database.
/// Should be called once at application startup, after migrations.
/// </summary>
public static class RoleSeeder
{
    /// <summary>
    /// Idempotent — safe to call on every startup.
    /// Creates roles and the default Admin account if they don't already exist.
    /// </summary>
    public static async Task SeedAsync(IServiceProvider services)
    {
        var logger      = services.GetRequiredService<ILogger<Program>>();
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var config      = services.GetRequiredService<IConfiguration>();

        // ── 1. Seed all roles ─────────────────────────────────────────────────
        foreach (var role in AppRoles.All)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                var result = await roleManager.CreateAsync(new IdentityRole(role));
                if (result.Succeeded)
                    logger.LogInformation("Role '{Role}' seeded successfully.", role);
                else
                    logger.LogError("Failed to seed role '{Role}': {Errors}", role,
                        string.Join(", ", result.Errors.Select(e => e.Description)));
            }
        }

        // ── 2. Seed default Admin user ────────────────────────────────────────
        var adminSection = config.GetSection("DefaultAdmin");
        var adminEmail   = adminSection["Email"];
        var adminPassword = adminSection["Password"];

        if (string.IsNullOrWhiteSpace(adminEmail) || string.IsNullOrWhiteSpace(adminPassword))
        {
            logger.LogWarning(
                "DefaultAdmin config missing — skipping admin seed. " +
                "Add DefaultAdmin:Email and DefaultAdmin:Password to appsettings.");
            return;
        }

        var existingAdmin = await userManager.FindByEmailAsync(adminEmail);
        if (existingAdmin is null)
        {
            var admin = new ApplicationUser
            {
                FirstName    = "System",
                LastName     = "Admin",
                Email        = adminEmail,
                UserName     = adminEmail,
                EmailConfirmed = true,
                IsActive     = true
            };

            var createResult = await userManager.CreateAsync(admin, adminPassword);
            if (createResult.Succeeded)
            {
                await userManager.AddToRoleAsync(admin, AppRoles.Admin);
                logger.LogInformation(
                    "Default admin account created: {Email} with role '{Role}'.",
                    adminEmail, AppRoles.Admin);
            }
            else
            {
                logger.LogError("Failed to create default admin '{Email}': {Errors}",
                    adminEmail,
                    string.Join(", ", createResult.Errors.Select(e => e.Description)));
            }
        }
        else
        {
            // Ensure existing admin has the Admin role even if it was added manually before seeding
            if (!await userManager.IsInRoleAsync(existingAdmin, AppRoles.Admin))
            {
                await userManager.AddToRoleAsync(existingAdmin, AppRoles.Admin);
                logger.LogInformation("Admin role assigned to existing user '{Email}'.", adminEmail);
            }
        }
    }
}
