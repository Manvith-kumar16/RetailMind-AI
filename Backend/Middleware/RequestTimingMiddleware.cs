using System.Diagnostics;

namespace RetailMind.API.Middleware;

/// <summary>
/// Adds X-Response-Time-Ms header to every response for performance observability.
/// </summary>
public sealed class RequestTimingMiddleware
{
    private readonly RequestDelegate _next;

    public RequestTimingMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context)
    {
        var sw = Stopwatch.StartNew();
        context.Response.OnStarting(() =>
        {
            sw.Stop();
            context.Response.Headers["X-Response-Time-Ms"] = sw.ElapsedMilliseconds.ToString();
            return Task.CompletedTask;
        });

        await _next(context);
    }
}
