namespace CompensaIdentityApi.Infrastructure.Auth;

public sealed record JwtTokenResult(string AccessToken, DateTimeOffset ExpiresAt);
