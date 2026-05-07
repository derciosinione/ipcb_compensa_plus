namespace CompensaIdentityApi.Infrastructure.MagicLinks;

public interface IMagicLinkUrlBuilder
{
    string BuildVerifyUrl(string token);
}
