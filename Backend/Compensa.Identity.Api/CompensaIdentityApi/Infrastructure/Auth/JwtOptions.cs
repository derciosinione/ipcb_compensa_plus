namespace CompensaIdentityApi.Infrastructure.Auth;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Issuer { get; init; } = "Compensa.Identity";
    public string Audience { get; init; } = "Compensa.Api";
    public string SigningKey { get; init; } = string.Empty;
    public int AccessTokenMinutes { get; init; } = 60;
}
