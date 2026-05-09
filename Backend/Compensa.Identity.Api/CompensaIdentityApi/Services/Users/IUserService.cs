using CompensaIdentityApi.Contracts.Users;

namespace CompensaIdentityApi.Services.Users;

public interface IUserService
{
    Task<IReadOnlyCollection<UserResponse>> ListAsync(string? search, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<RoleResponse>> ListRolesAsync(CancellationToken cancellationToken = default);
    Task<UserResponse> CreateAsync(CreateUserRequest request, CancellationToken cancellationToken = default);
    Task<UserResponse> UpdateRolesAsync(string id, UpdateUserRolesRequest request, CancellationToken cancellationToken = default);
}
