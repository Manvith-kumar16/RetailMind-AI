using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RetailMind.API.Data;
using RetailMind.API.DTOs.Auth;
using RetailMind.API.Models.Identity;
using RetailMind.API.Services.Email;

namespace RetailMind.API.Services.Auth;

/// <summary>
/// Handles all authentication operations: registration, login, JWT generation,
/// refresh token rotation, password management, and admin user management.
/// </summary>
public sealed class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole>   _roleManager;
    private readonly AppDbContext                _context;
    private readonly IConfiguration              _config;
    private readonly IEmailService               _emailService;
    private readonly ILogger<AuthService>        _logger;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole>   roleManager,
        AppDbContext                context,
        IConfiguration              config,
        IEmailService               emailService,
        ILogger<AuthService>        logger)
    {
        _userManager  = userManager;
        _roleManager  = roleManager;
        _context      = context;
        _config       = config;
        _emailService = emailService;
        _logger       = logger;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //   CORE AUTH
    // ═══════════════════════════════════════════════════════════════════════════

    /// <inheritdoc/>
    public async Task<AuthResponseDto> RegisterAsync(
        RegisterRequestDto dto, CancellationToken ct = default)
    {
        // Guard: duplicate email
        if (await _userManager.FindByEmailAsync(dto.Email) is not null)
            throw new InvalidOperationException("An account with this email already exists.");

        var user = new ApplicationUser
        {
            FirstName        = dto.FirstName.Trim(),
            LastName         = dto.LastName.Trim(),
            Email            = dto.Email.Trim().ToLowerInvariant(),
            UserName         = dto.Email.Trim().ToLowerInvariant(),
            EmailConfirmed   = true,   // set to false and send email in production
            IsActive         = true
        };

        // Identity hashes the password internally (bcrypt-based PBKDF2)
        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
            throw new InvalidOperationException(FormatIdentityErrors(result));

        // Assign default role — ensure it exists first
        await EnsureRoleExistsAsync(AppRoles.Staff);
        await _userManager.AddToRoleAsync(user, AppRoles.Staff);

        _logger.LogInformation(
            "User registered: {Email} | Id: {UserId}", user.Email, user.Id);

        return await BuildAuthResponseAsync(user, ct);
    }

    /// <inheritdoc/>
    public async Task<AuthResponseDto> LoginAsync(
        LoginRequestDto dto, CancellationToken ct = default)
    {
        // Always look up by normalised email to prevent case-based bypass
        var user = await _userManager.FindByEmailAsync(dto.Email.Trim())
            ?? throw new UnauthorizedAccessException("Invalid email or password.");

        // Account status guards — must happen BEFORE CheckPasswordAsync to prevent
        // timing-attack-based user enumeration via lock-out state
        if (!user.IsActive)
            throw new UnauthorizedAccessException(
                "Your account has been deactivated. Please contact support.");

        // Locks account after N failed attempts (configured in Identity options)
        if (await _userManager.IsLockedOutAsync(user))
            throw new UnauthorizedAccessException(
                $"Account is temporarily locked. Try again after {user.LockoutEnd:HH:mm} UTC.");

        if (!await _userManager.CheckPasswordAsync(user, dto.Password))
        {
            // Increment access-failed counter (drives lockout)
            await _userManager.AccessFailedAsync(user);

            _logger.LogWarning(
                "Failed login attempt for {Email}. " +
                "AccessFailedCount: {Count}",
                dto.Email,
                await _userManager.GetAccessFailedCountAsync(user));

            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        // Reset failed counter on successful login
        await _userManager.ResetAccessFailedCountAsync(user);

        user.LastLoginAt = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        _logger.LogInformation(
            "Successful login: {Email} | Id: {UserId}", user.Email, user.Id);

        return await BuildAuthResponseAsync(user, ct);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //   TOKEN MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════

    /// <inheritdoc/>
    public async Task<AuthResponseDto> RefreshTokenAsync(
        string refreshToken, string ipAddress, CancellationToken ct = default)
    {
        var token = await _context.RefreshTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.Token == refreshToken, ct)
            ?? throw new UnauthorizedAccessException("Invalid refresh token.");

        if (token.IsRevoked)
        {
            // Detect token reuse — revoke the entire descendant chain (security measure)
            await RevokeDescendantTokensAsync(token, ipAddress, "Attempted reuse of revoked token");
            _logger.LogWarning(
                "Refresh token reuse detected for user {UserId}. " +
                "All tokens revoked.", token.UserId);
            throw new UnauthorizedAccessException(
                "Refresh token has been revoked. All sessions have been terminated for security.");
        }

        if (token.IsExpired)
            throw new UnauthorizedAccessException("Refresh token has expired. Please log in again.");

        if (!token.User.IsActive)
            throw new UnauthorizedAccessException("Account is disabled.");

        // Token rotation — old token → revoked, new token issued
        var newRefreshToken = CreateRefreshToken(ipAddress);
        token.IsRevoked       = true;
        token.ReplacedByToken = newRefreshToken.Token;
        token.RevokedByIp     = ipAddress;
        newRefreshToken.UserId = token.UserId;

        _context.RefreshTokens.Update(token);
        await _context.RefreshTokens.AddAsync(newRefreshToken, ct);

        // Clean up old expired tokens for this user (keep DB tidy)
        await RemoveExpiredTokensAsync(token.UserId, ct);

        await _context.SaveChangesAsync(ct);

        return await BuildAuthResponseAsync(token.User, ct);
    }

    /// <inheritdoc/>
    public async Task RevokeTokenAsync(
        string refreshToken, string ipAddress, CancellationToken ct = default)
    {
        var token = await _context.RefreshTokens
            .FirstOrDefaultAsync(t => t.Token == refreshToken, ct)
            ?? throw new KeyNotFoundException("Refresh token not found.");

        if (!token.IsActive)
            throw new InvalidOperationException("Token is already revoked or expired.");

        token.IsRevoked   = true;
        token.RevokedByIp = ipAddress;
        _context.RefreshTokens.Update(token);
        await _context.SaveChangesAsync(ct);

        _logger.LogInformation(
            "Refresh token manually revoked for user {UserId}.", token.UserId);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //   PROFILE & PASSWORD MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════

    /// <inheritdoc/>
    public async Task<UserProfileDto> GetProfileAsync(
        string userId, CancellationToken ct = default)
    {
        var user  = await FindUserOrThrowAsync(userId);
        var roles = await _userManager.GetRolesAsync(user);
        return ToUserProfileDto(user, roles);
    }

    /// <inheritdoc/>
    public async Task ChangePasswordAsync(
        string userId, ChangePasswordRequestDto dto, CancellationToken ct = default)
    {
        var user   = await FindUserOrThrowAsync(userId);
        var result = await _userManager.ChangePasswordAsync(
            user, dto.CurrentPassword, dto.NewPassword);

        if (!result.Succeeded)
            throw new InvalidOperationException(FormatIdentityErrors(result));

        // Revoke all refresh tokens to force re-login on other devices
        await RevokeAllUserTokensAsync(userId, "Password changed", ct);

        _logger.LogInformation(
            "Password changed for user {UserId}. All sessions terminated.", userId);
    }

    /// <inheritdoc/>
    public async Task ForgotPasswordAsync(
        ForgotPasswordRequestDto dto, CancellationToken ct = default)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email.Trim());

        // Always return success — never reveal whether email exists (prevents enumeration)
        if (user is null || !user.IsActive)
        {
            _logger.LogInformation(
                "Forgot-password requested for unknown/inactive email: {Email}", dto.Email);
            return;
        }

        var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);

        // TODO: Send email via IEmailService with resetToken and user.Email
        // For now, log it (REMOVE in production — logs must not contain tokens)
        _logger.LogWarning(
            "Password reset token generated for {Email}. " +
            "Wire up IEmailService to send this: {Token}",
            user.Email, resetToken);
    }

    /// <inheritdoc/>
    public async Task ResetPasswordAsync(
        ResetPasswordRequestDto dto, CancellationToken ct = default)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email.Trim())
            ?? throw new InvalidOperationException("Invalid reset request.");

        var result = await _userManager.ResetPasswordAsync(user, dto.Token, dto.NewPassword);
        if (!result.Succeeded)
            throw new InvalidOperationException(FormatIdentityErrors(result));

        // Revoke all refresh tokens after reset
        await RevokeAllUserTokensAsync(user.Id, "Password reset", ct);

        _logger.LogInformation(
            "Password reset completed for {Email}. All sessions terminated.", dto.Email);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //   ADMIN USER MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════

    /// <inheritdoc/>
    public async Task<IEnumerable<UserSummaryDto>> GetAllUsersAsync(
        CancellationToken ct = default)
    {
        var users  = await _userManager.Users.ToListAsync(ct);
        var result = new List<UserSummaryDto>(users.Count);

        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            result.Add(new UserSummaryDto(
                user.Id,
                $"{user.FirstName} {user.LastName}",
                user.Email!,
                roles,
                user.IsActive,
                user.CreatedAt));
        }

        return result;
    }

    /// <inheritdoc/>
    public async Task AssignRoleAsync(
        AssignRoleRequestDto dto, CancellationToken ct = default)
    {
        var user = await FindUserOrThrowAsync(dto.UserId);
        await EnsureRoleExistsAsync(dto.Role);

        if (await _userManager.IsInRoleAsync(user, dto.Role))
            throw new InvalidOperationException(
                $"User already has the '{dto.Role}' role.");

        var result = await _userManager.AddToRoleAsync(user, dto.Role);
        if (!result.Succeeded)
            throw new InvalidOperationException(FormatIdentityErrors(result));

        _logger.LogInformation(
            "Role '{Role}' assigned to user {UserId}.", dto.Role, dto.UserId);
    }

    /// <inheritdoc/>
    public async Task RemoveRoleAsync(
        AssignRoleRequestDto dto, CancellationToken ct = default)
    {
        var user = await FindUserOrThrowAsync(dto.UserId);

        if (!await _userManager.IsInRoleAsync(user, dto.Role))
            throw new InvalidOperationException(
                $"User does not have the '{dto.Role}' role.");

        // Prevent removing the last Admin
        if (dto.Role == AppRoles.Admin)
        {
            var adminUsers = await _userManager.GetUsersInRoleAsync(AppRoles.Admin);
            if (adminUsers.Count <= 1)
                throw new InvalidOperationException(
                    "Cannot remove the last admin. Assign another admin first.");
        }

        var result = await _userManager.RemoveFromRoleAsync(user, dto.Role);
        if (!result.Succeeded)
            throw new InvalidOperationException(FormatIdentityErrors(result));

        _logger.LogInformation(
            "Role '{Role}' removed from user {UserId}.", dto.Role, dto.UserId);
    }

    /// <inheritdoc/>
    public async Task ToggleUserActiveAsync(
        ToggleUserActiveRequestDto dto, CancellationToken ct = default)
    {
        var user = await FindUserOrThrowAsync(dto.UserId);
        user.IsActive = dto.IsActive;
        await _userManager.UpdateAsync(user);

        if (!dto.IsActive)
        {
            // Revoke all sessions immediately on deactivation
            await RevokeAllUserTokensAsync(user.Id, "Account deactivated by admin", ct);
        }

        _logger.LogInformation(
            "User {UserId} active status set to {IsActive}.", dto.UserId, dto.IsActive);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //   PRIVATE HELPERS
    // ═══════════════════════════════════════════════════════════════════════════

    private async Task<AuthResponseDto> BuildAuthResponseAsync(
        ApplicationUser user, CancellationToken ct)
    {
        var roles        = await _userManager.GetRolesAsync(user);
        var accessToken  = GenerateJwtToken(user, roles);
        var refreshToken = CreateRefreshToken(string.Empty);
        refreshToken.UserId = user.Id;

        await _context.RefreshTokens.AddAsync(refreshToken, ct);
        await _context.SaveChangesAsync(ct);

        var expMinutes = _config.GetValue<int>("JwtSettings:ExpirationMinutes", 60);

        return new AuthResponseDto(
            AccessToken:  accessToken,
            RefreshToken: refreshToken.Token,
            ExpiresAt:    DateTime.UtcNow.AddMinutes(expMinutes),
            User:         ToUserProfileDto(user, roles));
    }

    private string GenerateJwtToken(ApplicationUser user, IList<string> roles)
    {
        var jwt = _config.GetSection("JwtSettings");
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwt["SecretKey"]
                ?? throw new InvalidOperationException("JWT SecretKey is missing.")));

        var claims = new List<Claim>
        {
            // Standard claims
            new(JwtRegisteredClaimNames.Sub,  user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email!),
            new(JwtRegisteredClaimNames.GivenName, user.FirstName),
            new(JwtRegisteredClaimNames.FamilyName, user.LastName),
            new(JwtRegisteredClaimNames.Jti,  Guid.NewGuid().ToString()),         // unique token id
            new(JwtRegisteredClaimNames.Iat,                                      // issued-at
                DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(),
                ClaimValueTypes.Integer64),

            // Identity claims (used by [Authorize] and ClaimsPrincipal helpers)
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Email,          user.Email!),
            new(ClaimTypes.GivenName,      user.FirstName),
            new(ClaimTypes.Surname,        user.LastName),
        };

        // Add one claim per role — ASP.NET Core reads ClaimTypes.Role for [Authorize(Roles=...)]
        claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));

        var expiry = DateTime.UtcNow.AddMinutes(
            _config.GetValue<int>("JwtSettings:ExpirationMinutes", 60));

        var token = new JwtSecurityToken(
            issuer:             jwt["Issuer"],
            audience:           jwt["Audience"],
            claims:             claims,
            notBefore:          DateTime.UtcNow,
            expires:            expiry,
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256));

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    /// <summary>
    /// Creates a cryptographically random refresh token (64 bytes → 88-char base64 string).
    /// Never stored in JWT — stored only in DB, transmitted only over HTTPS.
    /// </summary>
    private static RefreshToken CreateRefreshToken(string ipAddress)
    {
        Span<byte> bytes = stackalloc byte[64];
        RandomNumberGenerator.Fill(bytes);

        return new RefreshToken
        {
            Token       = Convert.ToBase64String(bytes),
            Expires     = DateTime.UtcNow.AddDays(7),
            CreatedAt   = DateTime.UtcNow,
            CreatedByIp = ipAddress
        };
    }

    private async Task RevokeDescendantTokensAsync(
        RefreshToken token, string ipAddress, string reason)
    {
        if (string.IsNullOrWhiteSpace(token.ReplacedByToken)) return;

        var childToken = await _context.RefreshTokens
            .FirstOrDefaultAsync(t => t.Token == token.ReplacedByToken);

        if (childToken is null) return;

        if (childToken.IsActive)
        {
            childToken.IsRevoked   = true;
            childToken.RevokedByIp = ipAddress;
            _context.RefreshTokens.Update(childToken);
        }

        await RevokeDescendantTokensAsync(childToken, ipAddress, reason);
    }

    private async Task RevokeAllUserTokensAsync(
        string userId, string reason, CancellationToken ct)
    {
        var activeTokens = await _context.RefreshTokens
            .Where(t => t.UserId == userId && !t.IsRevoked && t.Expires > DateTime.UtcNow)
            .ToListAsync(ct);

        foreach (var t in activeTokens)
            t.IsRevoked = true;

        if (activeTokens.Count > 0)
            await _context.SaveChangesAsync(ct);
    }

    private async Task RemoveExpiredTokensAsync(string userId, CancellationToken ct)
    {
        var expired = await _context.RefreshTokens
            .Where(t => t.UserId == userId &&
                        (t.IsRevoked || t.Expires < DateTime.UtcNow.AddDays(-1)))
            .ToListAsync(ct);

        if (expired.Count > 0)
            _context.RefreshTokens.RemoveRange(expired);
    }

    private async Task<ApplicationUser> FindUserOrThrowAsync(string userId) =>
        await _userManager.FindByIdAsync(userId)
        ?? throw new KeyNotFoundException($"User '{userId}' not found.");

    private async Task EnsureRoleExistsAsync(string roleName)
    {
        if (!await _roleManager.RoleExistsAsync(roleName))
            await _roleManager.CreateAsync(new IdentityRole(roleName));
    }

    private static string FormatIdentityErrors(IdentityResult result) =>
        string.Join(" ", result.Errors.Select(e => e.Description));

    private static UserProfileDto ToUserProfileDto(
        ApplicationUser user, IList<string> roles) =>
        new(user.Id, user.FirstName, user.LastName, user.Email!,
            roles, user.CreatedAt, user.LastLoginAt, user.IsActive);
}
