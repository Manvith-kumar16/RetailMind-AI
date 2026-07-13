namespace RetailMind.API.DTOs.Auth;

// ── Registration / Login ─────────────────────────────────────────────────────

/// <summary>Payload for creating a new user account.</summary>
public sealed record RegisterRequestDto(
    string FirstName,
    string LastName,
    string Email,
    string Password,
    string ConfirmPassword);

/// <summary>Payload for authenticating an existing user.</summary>
public sealed record LoginRequestDto(
    string Email,
    string Password);

// ── Token management ────────────────────────────────────────────────────────

public sealed record RefreshTokenRequestDto(string RefreshToken);
public sealed record RevokeTokenRequestDto(string RefreshToken);

// ── Password management ─────────────────────────────────────────────────────

/// <summary>Authenticated user changes their own password.</summary>
public sealed record ChangePasswordRequestDto(
    string CurrentPassword,
    string NewPassword,
    string ConfirmNewPassword);

/// <summary>Initiates the forgot-password flow (sends reset email).</summary>
public sealed record ForgotPasswordRequestDto(string Email);

/// <summary>Completes the forgot-password flow using the emailed token.</summary>
public sealed record ResetPasswordRequestDto(
    string Email,
    string Token,
    string NewPassword,
    string ConfirmNewPassword);

// ── Admin user management ────────────────────────────────────────────────────

/// <summary>Admin assigns or removes a role from a user.</summary>
public sealed record AssignRoleRequestDto(string UserId, string Role);

/// <summary>Admin toggles the active state of a user account.</summary>
public sealed record ToggleUserActiveRequestDto(string UserId, bool IsActive);

// ── Responses ────────────────────────────────────────────────────────────────

/// <summary>Returned on every successful auth operation (login / register / refresh).</summary>
public sealed record AuthResponseDto(
    string       AccessToken,
    string       RefreshToken,
    DateTime     ExpiresAt,
    UserProfileDto User);

/// <summary>Authenticated user's sanitised profile data.</summary>
public sealed record UserProfileDto(
    string              Id,
    string              FirstName,
    string              LastName,
    string              Email,
    IEnumerable<string> Roles,
    DateTime            CreatedAt,
    DateTime?           LastLoginAt,
    bool                IsActive);

/// <summary>Minimal user summary used in admin lists.</summary>
public sealed record UserSummaryDto(
    string              Id,
    string              FullName,
    string              Email,
    IEnumerable<string> Roles,
    bool                IsActive,
    DateTime            CreatedAt);
