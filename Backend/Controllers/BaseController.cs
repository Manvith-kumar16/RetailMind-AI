using Microsoft.AspNetCore.Mvc;
using RetailMind.API.DTOs.Common;

namespace RetailMind.API.Controllers;

/// <summary>
/// Base controller — provides shared helpers for consistent API responses.
/// </summary>
[ApiController]
[Produces("application/json")]
public abstract class BaseController : ControllerBase
{
    protected IActionResult Ok<T>(T data, string message = "Success") =>
        base.Ok(ApiResponse<T>.Ok(data, message));

    protected IActionResult Created<T>(string routeName, object? routeValues, T data) =>
        base.CreatedAtRoute(routeName, routeValues, ApiResponse<T>.Ok(data, "Created successfully."));

    protected IActionResult Fail(string message, int statusCode = 400) =>
        StatusCode(statusCode, ApiResponse<object>.Fail(message));

    protected string CurrentUserId =>
        User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
        ?? throw new UnauthorizedAccessException("User not authenticated.");
}
