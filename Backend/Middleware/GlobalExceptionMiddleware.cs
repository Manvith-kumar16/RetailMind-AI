using System.Net;
using System.Text.Json;
using RetailMind.API.DTOs.Common;
using RetailMind.API.Exceptions;

namespace RetailMind.API.Middleware;

/// <summary>
/// Catches all unhandled exceptions and returns a structured JSON error response.
/// Formats ASP.NET Controller errors to standard ApiResponse shapes.
/// </summary>
public sealed class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public GlobalExceptionMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionMiddleware> logger,
        IHostEnvironment env)
    {
        _next   = next;
        _logger = logger;
        _env    = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Caught an unhandled exception: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception ex)
    {
        context.Response.ContentType = "application/json";

        var (statusCode, message, errors) = ex switch
        {
            NotFoundException e => 
                (HttpStatusCode.NotFound, e.Message, null),
                
            ConflictException e => 
                (HttpStatusCode.Conflict, e.Message, null),
                
            BadRequestException e => 
                (HttpStatusCode.BadRequest, e.Message, null),

            // Base fallback for domain exceptions
            AppException e => 
                (HttpStatusCode.BadRequest, e.Message, null),

            UnauthorizedAccessException e => 
                (HttpStatusCode.Unauthorized, e.Message, null),
                
            InvalidOperationException e => 
                (HttpStatusCode.BadRequest, e.Message, null),
                
            ArgumentException e => 
                (HttpStatusCode.BadRequest, e.Message, null),

            // Fallback for everything else
            _ => (HttpStatusCode.InternalServerError, "An unexpected error occurred.", _env.IsDevelopment() ? new string[] { ex.ToString() } : null)
        };

        context.Response.StatusCode = (int)statusCode;

        var response = ApiResponse<object>.Fail(message, errors);

        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        await context.Response.WriteAsync(JsonSerializer.Serialize(response, options));
    }
}
