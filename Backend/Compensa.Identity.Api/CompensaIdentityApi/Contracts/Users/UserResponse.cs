namespace CompensaIdentityApi.Contracts.Users;

public sealed record UserResponse(
    string Id,
    string Email,
    string? FullName,
    IReadOnlyCollection<string> Roles,
    bool EmailConfirmed,
    DateTime CreatedAt,
    DateTime UpdatedAt);
