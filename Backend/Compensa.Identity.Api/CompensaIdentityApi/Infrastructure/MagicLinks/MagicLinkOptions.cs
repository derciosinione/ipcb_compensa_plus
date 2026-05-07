namespace CompensaIdentityApi.Infrastructure.MagicLinks;

public sealed class MagicLinkOptions
{
    public const string SectionName = "MagicLinks";

    public int ExpirationMinutes { get; init; } = 15;
    public string VerifyPath { get; init; } = "/api/auth/verify";
}
