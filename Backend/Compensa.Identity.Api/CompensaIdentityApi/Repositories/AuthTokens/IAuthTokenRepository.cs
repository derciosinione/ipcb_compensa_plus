using CompensaIdentityApi.Models;

namespace CompensaIdentityApi.Repositories.AuthTokens;

public interface IAuthTokenRepository
{
    Task AddAsync(AuthToken authToken, CancellationToken cancellationToken = default);
    Task<AuthToken?> FindValidTokenWithUserAsync(string tokenHash, DateTime utcNow, CancellationToken cancellationToken = default);
    Task MarkAsUsedAsync(AuthToken authToken, DateTime usedAtUtc, CancellationToken cancellationToken = default);
}
