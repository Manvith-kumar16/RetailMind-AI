namespace RetailMind.API.Middleware;

/// <summary>
/// Injects essential security headers into every HTTP response to harden the API surface.
/// </summary>
public sealed class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;

    public SecurityHeadersMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context)
    {
        var headers = context.Response.Headers;

        // ── Security Headers ──────────────────────────────────────────────────
        
        // Prevent browsers from mime-sniffing a response away from the declared content-type
        headers["X-Content-Type-Options"] = "nosniff";

        // Protect against Clickjacking attacks (prevents embedding in iframes)
        headers["X-Frame-Options"] = "DENY";

        // Enable XSS filtering in browsers (legacy protection)
        headers["X-XSS-Protection"] = "1; mode=block";

        // Enforce HTTPS-only communication (HSTS) - 1 Year duration
        headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload";

        // Referrer policy - only send original URL when navigating on same origin
        headers["Referrer-Policy"] = "strict-origin-when-cross-origin";

        // Content Security Policy - Minimalist baseline for an API
        headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none';";

        await _next(context);
    }
}
