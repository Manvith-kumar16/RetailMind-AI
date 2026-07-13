using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using RetailMind.API.DTOs.Auth;
using RetailMind.API.Models.Identity;
using RetailMind.API.Services.Auth;
using RetailMind.API.Services.Email;

namespace RetailMind.API.Controllers;

/// <summary>
/// Authentication and authorization controller.
/// Handles registration, login, token management, and administrative user operations.
/// </summary>
[Route("api/v1/auth")]
public sealed class AuthController : BaseController
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //   PUBLIC ENDPOINTS (no JWT required)
    // ═══════════════════════════════════════════════════════════════════════════

    /// <summary>
    /// Register a new user account. New accounts get the 'Staff' role by default.
    /// </summary>
    /// <response code="201">Account created — returns JWT + profile.</response>
    /// <response code="400">Validation errors or email already registered.</response>
    [HttpPost("register")]
    [AllowAnonymous]
    [EnableRateLimiting("AuthPolicy")]   // 10 req/min per IP — stops automated registration
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<IActionResult> Register(
        [FromBody] RegisterRequestDto dto,
        CancellationToken ct)
    {
        var result = await _authService.RegisterAsync(dto, ct);
        return Created("GetMyProfile", new { }, result);
    }

    /// <summary>
    /// Authenticate with email + password. Returns a JWT access token and a refresh token.
    /// </summary>
    /// <response code="200">Auth successful — returns JWT + refresh token.</response>
    /// <response code="401">Invalid credentials or account locked/deactivated.</response>
    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting("AuthPolicy")]   // 10 req/min per IP — stops credential brute-force
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<IActionResult> Login(
        [FromBody] LoginRequestDto dto,
        CancellationToken ct)
    {
        var result = await _authService.LoginAsync(dto, ct);
        return Ok(result, "Login successful.");
    }

    /// <summary>
    /// Exchange a valid, non-expired refresh token for a new access + refresh token pair.
    /// The old refresh token is rotated (revoked) — single-use semantics.
    /// </summary>
    /// <response code="200">Tokens refreshed successfully.</response>
    /// <response code="401">Refresh token invalid, expired, or revoked.</response>
    [HttpPost("refresh-token")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> RefreshToken(
        [FromBody] RefreshTokenRequestDto dto,
        CancellationToken ct)
    {
        var result = await _authService.RefreshTokenAsync(dto.RefreshToken, GetClientIp(), ct);
        return Ok(result, "Tokens refreshed.");
    }

    /// <summary>
    /// Revoke a refresh token to log out from the current device.
    /// </summary>
    /// <response code="200">Token revoked — session terminated.</response>
    /// <response code="400">Token not found or already revoked.</response>
    [HttpPost("revoke-token")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RevokeToken(
        [FromBody] RefreshTokenRequestDto dto,
        CancellationToken ct)
    {
        await _authService.RevokeTokenAsync(dto.RefreshToken, GetClientIp(), ct);
        return Ok<object>(null!, "Logged out successfully.");
    }

    /// <summary>
    /// Initiate the forgot-password flow. Sends a reset link to the registered email.
    /// Always returns 200 to prevent user enumeration.
    /// </summary>
    [HttpPost("forgot-password")]
    [AllowAnonymous]
    [EnableRateLimiting("AuthPolicy")]   // Prevent reset-email flooding
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<IActionResult> ForgotPassword(
        [FromBody] ForgotPasswordRequestDto dto,
        CancellationToken ct)
    {
        await _authService.ForgotPasswordAsync(dto, ct);
        // Always return 200 — never confirm whether email exists
        return Ok<object>(null!, "If that email is registered, a reset link will be sent.");
    }

    /// <summary>
    /// Complete the forgot-password flow using the token sent by email.
    /// </summary>
    /// <response code="200">Password reset successfully. All sessions terminated.</response>
    /// <response code="400">Invalid token or password does not meet requirements.</response>
    [HttpPost("reset-password")]
    [AllowAnonymous]
    [EnableRateLimiting("AuthPolicy")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<IActionResult> ResetPassword(
        [FromBody] ResetPasswordRequestDto dto,
        CancellationToken ct)
    {
        await _authService.ResetPasswordAsync(dto, ct);
        return Ok<object>(null!, "Password reset successfully. Please log in again.");
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //   AUTHENTICATED USER ENDPOINTS (any valid JWT)
    // ═══════════════════════════════════════════════════════════════════════════

    /// <summary>
    /// Get the currently authenticated user's profile.
    /// </summary>
    /// <response code="200">User profile with roles.</response>
    /// <response code="401">No valid JWT provided.</response>
    [HttpGet("me", Name = "GetMyProfile")]
    [Authorize]
    [ProducesResponseType(typeof(UserProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMyProfile(CancellationToken ct)
    {
        var profile = await _authService.GetProfileAsync(CurrentUserId, ct);
        return Ok(profile);
    }

    /// <summary>
    /// Change the authenticated user's password.
    /// Revokes all other active sessions after success.
    /// </summary>
    /// <response code="200">Password changed. All other sessions terminated.</response>
    /// <response code="400">Validation errors or wrong current password.</response>
    [HttpPost("change-password")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ChangePassword(
        [FromBody] ChangePasswordRequestDto dto,
        CancellationToken ct)
    {
        await _authService.ChangePasswordAsync(CurrentUserId, dto, ct);
        return Ok<object>(null!, "Password changed. Other sessions have been terminated.");
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //   ADMIN ENDPOINTS (Admin role required)
    // ═══════════════════════════════════════════════════════════════════════════

    /// <summary>
    /// Get a list of all registered users. Admin only.
    /// </summary>
    [HttpGet("users")]
    [Authorize(Roles = AppRoles.Admin)]
    [ProducesResponseType(typeof(IEnumerable<UserSummaryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetAllUsers(CancellationToken ct)
    {
        var users = await _authService.GetAllUsersAsync(ct);
        return Ok(users, $"Returned {users.Count()} users.");
    }

    /// <summary>
    /// Assign a role to a user. Admin only.
    /// Valid roles: Admin, Manager, Staff, Vendor.
    /// </summary>
    /// <response code="200">Role assigned successfully.</response>
    /// <response code="400">User not found or already has this role.</response>
    [HttpPost("users/assign-role")]
    [Authorize(Roles = AppRoles.Admin)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> AssignRole(
        [FromBody] AssignRoleRequestDto dto,
        CancellationToken ct)
    {
        await _authService.AssignRoleAsync(dto, ct);
        return Ok<object>(null!, $"Role '{dto.Role}' assigned to user.");
    }

    /// <summary>
    /// Remove a role from a user. Admin only.
    /// Cannot remove the last Admin in the system.
    /// </summary>
    [HttpPost("users/remove-role")]
    [Authorize(Roles = AppRoles.Admin)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> RemoveRole(
        [FromBody] AssignRoleRequestDto dto,
        CancellationToken ct)
    {
        await _authService.RemoveRoleAsync(dto, ct);
        return Ok<object>(null!, $"Role '{dto.Role}' removed from user.");
    }

    /// <summary>
    /// Activate or deactivate a user account. Admin only.
    /// Deactivating a user immediately revokes all their active sessions.
    /// </summary>
    [HttpPatch("users/toggle-active")]
    [Authorize(Roles = AppRoles.Admin)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ToggleUserActive(
        [FromBody] ToggleUserActiveRequestDto dto,
        CancellationToken ct)
    {
        await _authService.ToggleUserActiveAsync(dto, ct);
        var state = dto.IsActive ? "activated" : "deactivated";
        return Ok<object>(null!, $"User account {state} successfully.");
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private string GetClientIp() =>
        HttpContext.Connection.RemoteIpAddress?.MapToIPv4().ToString() ?? "unknown";
}
