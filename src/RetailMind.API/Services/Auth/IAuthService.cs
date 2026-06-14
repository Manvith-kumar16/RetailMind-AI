using RetailMind.API.DTOs.Auth;

namespace RetailMind.API.Services.Auth;

public interface IAuthService
{
    // ── Core auth ─────────────────────────────────────────────────────────────
    Task<AuthResponseDto> RegisterAsync(RegisterRequestDto dto, CancellationToken ct = default);
    Task<AuthResponseDto> LoginAsync(LoginRequestDto dto, CancellationToken ct = default);

    // ── Token management ──────────────────────────────────────────────────────
    Task<AuthResponseDto> RefreshTokenAsync(string refreshToken, string ipAddress, CancellationToken ct = default);
    Task                  RevokeTokenAsync(string refreshToken, string ipAddress, CancellationToken ct = default);

    // ── Profile & password ────────────────────────────────────────────────────
    Task<UserProfileDto> GetProfileAsync(string userId, CancellationToken ct = default);
    Task                 ChangePasswordAsync(string userId, ChangePasswordRequestDto dto, CancellationToken ct = default);
    Task                 ForgotPasswordAsync(ForgotPasswordRequestDto dto, CancellationToken ct = default);
    Task                 ResetPasswordAsync(ResetPasswordRequestDto dto, CancellationToken ct = default);

    // ── Admin operations ──────────────────────────────────────────────────────
    Task<IEnumerable<UserSummaryDto>> GetAllUsersAsync(CancellationToken ct = default);
    Task AssignRoleAsync(AssignRoleRequestDto dto, CancellationToken ct = default);
    Task RemoveRoleAsync(AssignRoleRequestDto dto, CancellationToken ct = default);
    Task ToggleUserActiveAsync(ToggleUserActiveRequestDto dto, CancellationToken ct = default);
}
