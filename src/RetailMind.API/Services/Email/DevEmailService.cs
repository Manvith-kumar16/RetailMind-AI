namespace RetailMind.API.Services.Email;

/// <summary>
/// Development-only email stub — logs emails to the console instead of sending them.
/// Replace with a real implementation (SendGrid, AWS SES, etc.) for production.
/// </summary>
public sealed class DevEmailService : IEmailService
{
    private readonly ILogger<DevEmailService> _logger;

    public DevEmailService(ILogger<DevEmailService> logger) => _logger = logger;

    public Task SendPasswordResetEmailAsync(
        string toEmail, string displayName, string resetLink, CancellationToken ct = default)
    {
        _logger.LogWarning(
            "[DEV EMAIL] Password Reset\n  To: {Email} ({Name})\n  Link: {Link}",
            toEmail, displayName, resetLink);
        return Task.CompletedTask;
    }

    public Task SendWelcomeEmailAsync(
        string toEmail, string displayName, string confirmationLink, CancellationToken ct = default)
    {
        _logger.LogInformation(
            "[DEV EMAIL] Welcome\n  To: {Email} ({Name})\n  Confirm: {Link}",
            toEmail, displayName, confirmationLink);
        return Task.CompletedTask;
    }

    public Task SendSecurityAlertAsync(
        string toEmail, string displayName, string subject, string messageBody, CancellationToken ct = default)
    {
        _logger.LogWarning(
            "[DEV EMAIL] Security Alert\n  To: {Email} ({Name})\n  Subject: {Subject}\n  Body: {Body}",
            toEmail, displayName, subject, messageBody);
        return Task.CompletedTask;
    }
}
