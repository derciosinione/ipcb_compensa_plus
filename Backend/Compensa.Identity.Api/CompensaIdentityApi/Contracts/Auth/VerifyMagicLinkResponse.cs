namespace CompensaIdentityApi.Contracts.Auth;

public sealed record VerifyMagicLinkResponse(
    string UserId,
    string? Email,
    string? FullName,
    IReadOnlyCollection<string> Roles);
