namespace CompensaIdentityApi.Contracts.Auth;

public sealed record LoginResponse(
    string Email,
    bool MagicLinkSent,
    string? DevMagicLink = null);
