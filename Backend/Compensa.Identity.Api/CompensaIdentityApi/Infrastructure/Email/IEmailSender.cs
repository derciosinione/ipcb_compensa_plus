namespace CompensaIdentityApi.Infrastructure.Email;

public interface IEmailSender
{
    Task SendMagicLinkAsync(string recipientEmail, string magicLink, CancellationToken cancellationToken = default);
}
