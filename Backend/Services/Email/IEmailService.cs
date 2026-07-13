namespace RetailMind.API.Services.Email;

/// <summary>
/// Abstraction over transactional email delivery.
/// Swap implementations to use SendGrid, AWS SES, Mailgun, etc.
/// </summary>
public interface IEmailService
{
    /// <summary>Sends a password-reset link to the user's email address.</summary>
    Task SendPasswordResetEmailAsync(
        string toEmail,
        string displayName,
        string resetLink,
        CancellationToken ct = default);

    /// <summary>Sends a welcome / email-confirmation message on registration.</summary>
    Task SendWelcomeEmailAsync(
        string toEmail,
        string displayName,
        string confirmationLink,
        CancellationToken ct = default);

    /// <summary>Sends a security alert (e.g. suspicious login, password changed).</summary>
    Task SendSecurityAlertAsync(
        string toEmail,
        string displayName,
        string subject,
        string messageBody,
        CancellationToken ct = default);
}
