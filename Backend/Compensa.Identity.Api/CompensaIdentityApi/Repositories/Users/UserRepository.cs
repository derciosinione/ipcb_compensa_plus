using CompensaIdentityApi.Data;
using CompensaIdentityApi.Models;
using Microsoft.EntityFrameworkCore;

namespace CompensaIdentityApi.Repositories.Users;

public sealed class UserRepository : IUserRepository
{
    private readonly ApplicationDbContext _context;

    public UserRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyCollection<ApplicationUser>> ListAsync(
        string? search,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Users.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var normalizedSearch = search.Trim().ToLowerInvariant();
            query = query.Where(user =>
                (user.FullName != null && user.FullName.ToLower().Contains(normalizedSearch)) ||
                (user.Email != null && user.Email.ToLower().Contains(normalizedSearch)));
        }

        return await query
            .OrderBy(user => user.FullName ?? user.Email)
            .ToArrayAsync(cancellationToken);
    }

    public async Task<ApplicationUser?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        return await _context.Users.FirstOrDefaultAsync(user => user.Id == id, cancellationToken);
    }

    public async Task<ApplicationUser?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = email.Trim().ToUpperInvariant();
        return await _context.Users.FirstOrDefaultAsync(user => user.NormalizedEmail == normalizedEmail, cancellationToken);
    }
}
