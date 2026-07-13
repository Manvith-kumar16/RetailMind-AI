using Serilog.Context;

namespace RetailMind.API.Middleware;

/// <summary>
/// Middleware to handle Request Correlation IDs for distributed tracing.
/// Ensures every request has a unique identifier in headers and logs.
/// </summary>
public sealed class CorrelationIdMiddleware
{
    private const string CorrelationIdHeader = "X-Correlation-Id";
    private readonly RequestDelegate _next;

    public CorrelationIdMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context)
    {
        // 1. Extract from header or generate new GUID
        var correlationId = context.Request.Headers[CorrelationIdHeader].FirstOrDefault() 
                            ?? Guid.NewGuid().ToString("N");

        // 2. Add to response header so client/gateway can track it
        context.Response.Headers[CorrelationIdHeader] = correlationId;

        // 3. Push to Serilog LogContext so every log message in this scope has the ID
        using (LogContext.PushProperty("CorrelationId", correlationId))
        {
            await _next(context);
        }
    }
}
