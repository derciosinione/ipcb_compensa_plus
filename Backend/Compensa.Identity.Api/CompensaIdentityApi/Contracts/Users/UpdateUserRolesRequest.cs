using System.ComponentModel.DataAnnotations;

namespace CompensaIdentityApi.Contracts.Users;

public sealed class UpdateUserRolesRequest
{
    [MinLength(1)]
    public IReadOnlyCollection<string> Roles { get; init; } = [];
}
