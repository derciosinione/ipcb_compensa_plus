using System.ComponentModel.DataAnnotations;

namespace CompensaIdentityApi.Contracts.Users;

public sealed class CreateUserRequest
{
    [Required]
    [MaxLength(200)]
    public string FullName { get; init; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(256)]
    public string Email { get; init; } = string.Empty;

    [MinLength(1)]
    public IReadOnlyCollection<string> Roles { get; init; } = [];
}
