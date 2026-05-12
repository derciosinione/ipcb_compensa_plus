using CompensaCoreApi.Data;
using CompensaCoreApi.Domain.AcademicYears;
using Microsoft.EntityFrameworkCore;

namespace CompensaCoreApi.Repositories.AcademicYears;

public sealed class AcademicYearRepository : IAcademicYearRepository
{
    private readonly CoreDbContext _context;

    public AcademicYearRepository(CoreDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyCollection<AcademicYear>> ListAsync(CancellationToken cancellationToken = default)
    {
        return await _context.AcademicYears
            .AsNoTracking()
            .OrderByDescending(year => year.StartsOn)
            .ToArrayAsync(cancellationToken);
    }

    public Task<AcademicYear?> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        return _context.AcademicYears
            .AsNoTracking()
            .FirstOrDefaultAsync(year => year.IsActive, cancellationToken);
    }

    public Task<AcademicYear?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _context.AcademicYears
            .AsNoTracking()
            .FirstOrDefaultAsync(year => year.Id == id, cancellationToken);
    }
}
