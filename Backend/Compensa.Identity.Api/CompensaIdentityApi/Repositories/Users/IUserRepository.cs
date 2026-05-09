using CompensaIdentityApi.Models;

namespace CompensaIdentityApi.Repositories.Users;

public interface IUserRepository
{
    Task<IReadOnlyCollection<ApplicationUser>> ListAsync(string? search, CancellationToken cancellationToken = default);
    Task<ApplicationUser?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<ApplicationUser?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
}
