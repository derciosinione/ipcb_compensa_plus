using CompensaIdentityApi.Data;
using CompensaIdentityApi.Models;
using Microsoft.EntityFrameworkCore;

namespace CompensaIdentityApi.Repositories.AuthTokens;

public sealed class AuthTokenRepository : IAuthTokenRepository
{
    private readonly ApplicationDbContext _context;

    public AuthTokenRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(AuthToken authToken, CancellationToken cancellationToken = default)
    {
        _context.AuthTokens.Add(authToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public Task<AuthToken?> FindValidTokenWithUserAsync(
        string tokenHash,
        DateTime utcNow,
        CancellationToken cancellationToken = default)
    {
        return _context.AuthTokens
            .Include(token => token.User)
            .FirstOrDefaultAsync(
                token => token.TokenHash == tokenHash &&
                         token.UsedAt == null &&
                         token.ExpiresAt > utcNow,
                cancellationToken);
    }

    public async Task MarkAsUsedAsync(
        AuthToken authToken,
        DateTime usedAtUtc,
        CancellationToken cancellationToken = default)
    {
        authToken.UsedAt = usedAtUtc;
        await _context.SaveChangesAsync(cancellationToken);
    }
}
