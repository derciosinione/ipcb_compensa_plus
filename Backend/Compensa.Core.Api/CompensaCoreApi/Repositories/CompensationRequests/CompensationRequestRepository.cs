using CompensaCoreApi.Data;
using CompensaCoreApi.Domain.CompensationRequests;
using Microsoft.EntityFrameworkCore;

namespace CompensaCoreApi.Repositories.CompensationRequests;

public sealed class CompensationRequestRepository : ICompensationRequestRepository
{
    private readonly CoreDbContext _context;

    public CompensationRequestRepository(CoreDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyCollection<CompensationRequest>> ListAsync(
        CompensationRequestStatus? status,
        string? teacherUserId,
        CancellationToken cancellationToken = default)
    {
        var query = _context.CompensationRequests.AsNoTracking();

        if (status.HasValue)
            query = query.Where(request => request.Status == status.Value);

        if (!string.IsNullOrWhiteSpace(teacherUserId))
            query = query.Where(request => request.TeacherUserId == teacherUserId);

        return await query
            .OrderByDescending(request => request.SubmittedAt)
            .ToArrayAsync(cancellationToken);
    }

    public Task<CompensationRequest?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _context.CompensationRequests.FirstOrDefaultAsync(request => request.Id == id, cancellationToken);
    }

    public async Task AddAsync(CompensationRequest request, CancellationToken cancellationToken = default)
    {
        _context.CompensationRequests.Add(request);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _context.SaveChangesAsync(cancellationToken);
    }
}
