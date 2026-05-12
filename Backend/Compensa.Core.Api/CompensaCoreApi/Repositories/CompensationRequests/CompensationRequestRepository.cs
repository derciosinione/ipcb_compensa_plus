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

    public async Task<CompensationRequest?> GetByIdAsync(Guid id, bool includeDocuments = false, CancellationToken cancellationToken = default)
    {
        var query = _context.CompensationRequests.AsQueryable();
        
        if (includeDocuments)
        {
            query = query.Include(request => request.Documents);
        }
        
        return await query.FirstOrDefaultAsync(request => request.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyCollection<CompensationRequest>> ListOverlappingActiveAsync(
        Guid academicYearId,
        int semester,
        DateOnly date,
        TimeOnly startTime,
        TimeOnly endTime,
        Guid? excludedRequestId,
        CancellationToken cancellationToken = default)
    {
        var query = _context.CompensationRequests
            .AsNoTracking()
            .Where(request =>
                request.AcademicYearId == academicYearId &&
                request.Semester == semester &&
                request.NewDate == date &&
                request.Status != CompensationRequestStatus.Rejected &&
                request.Status != CompensationRequestStatus.Cancelled &&
                request.NewStartTime < endTime &&
                startTime < request.NewEndTime);

        if (excludedRequestId.HasValue)
            query = query.Where(request => request.Id != excludedRequestId.Value);

        return await query.ToArrayAsync(cancellationToken);
    }

    public async Task AddAsync(CompensationRequest request, CancellationToken cancellationToken = default)
    {
        _context.CompensationRequests.Add(request);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public Task DeleteAsync(CompensationRequest request, CancellationToken cancellationToken = default)
    {
        _context.CompensationRequests.Remove(request);
        return _context.SaveChangesAsync(cancellationToken);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _context.SaveChangesAsync(cancellationToken);
    }
}
