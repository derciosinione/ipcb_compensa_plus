namespace CompensaIdentityApi.Contracts.Auth;

public sealed record VerifyMagicLinkResponse(
    string UserId,
    string? Email,
    string? FullName,
    IReadOnlyCollection<string> Roles,
    string AccessToken,
    DateTimeOffset AccessTokenExpiresAt,
    string RefreshToken,
    DateTimeOffset RefreshTokenExpiresAt);
