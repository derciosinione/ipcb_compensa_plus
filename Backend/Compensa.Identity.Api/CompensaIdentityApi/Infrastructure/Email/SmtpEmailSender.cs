using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Options;

namespace CompensaIdentityApi.Infrastructure.Email;

public sealed class SmtpEmailSender : IEmailSender
{
    private readonly EmailOptions _options;
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<SmtpEmailSender> _logger;

    public SmtpEmailSender(
        IOptions<EmailOptions> options,
        IWebHostEnvironment environment,
        ILogger<SmtpEmailSender> logger)
    {
        _options = options.Value;
        _environment = environment;
        _logger = logger;
    }

    public async Task SendMagicLinkAsync(
        string recipientEmail,
        string magicLink,
        CancellationToken cancellationToken = default)
    {
        if (!IsConfigured())
        {
            if (_environment.IsDevelopment())
            {
                _logger.LogWarning(
                    "Magic link email was not sent to {RecipientEmail} because SMTP settings are incomplete in development.",
                    recipientEmail);
                return;
            }

            throw new InvalidOperationException("Email settings are incomplete.");
        }

        using var message = new MailMessage
        {
            From = new MailAddress(_options.FromAddress, _options.FromName),
            Subject = "Your Compensa+ access link",
            Body = BuildMagicLinkBody(magicLink),
            IsBodyHtml = true
        };

        message.To.Add(recipientEmail);

        using var client = new SmtpClient(_options.SmtpHost, _options.SmtpPort)
        {
            EnableSsl = _options.UseStartTls,
            Credentials = new NetworkCredential(_options.Username, _options.Password)
        };

        await client.SendMailAsync(message, cancellationToken);
        _logger.LogInformation("Magic link email sent to {RecipientEmail}", recipientEmail);
    }

    private bool IsConfigured()
    {
        return !string.IsNullOrWhiteSpace(_options.FromAddress) &&
               !string.IsNullOrWhiteSpace(_options.SmtpHost) &&
               !string.IsNullOrWhiteSpace(_options.Username) &&
               !string.IsNullOrWhiteSpace(_options.Password);
    }

    private static string BuildMagicLinkBody(string magicLink) =>
        $"""
        <p>Hello,</p>
        <p>Use the secure link below to access Compensa+.</p>
        <p><a href="{WebUtility.HtmlEncode(magicLink)}">Access Compensa+</a></p>
        <p>This link expires shortly. If you did not request it, you can ignore this email.</p>
        """;
}
