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
            .FirstOrDefaultAsync(year => year.Id == id, cancellationToken);
    }

    public async Task AddAsync(AcademicYear academicYear, CancellationToken cancellationToken = default)
    {
        if (academicYear.IsActive)
        {
            await DeactivateAllOthers(academicYear.Id, cancellationToken);
        }

        await _context.AcademicYears.AddAsync(academicYear, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(AcademicYear academicYear, CancellationToken cancellationToken = default)
    {
        if (academicYear.IsActive)
        {
            await DeactivateAllOthers(academicYear.Id, cancellationToken);
        }

        _context.AcademicYears.Update(academicYear);
        await _context.SaveChangesAsync(cancellationToken);
    }

    private async Task DeactivateAllOthers(Guid currentId, CancellationToken cancellationToken)
    {
        var otherActiveYears = await _context.AcademicYears
            .Where(y => y.IsActive && y.Id != currentId)
            .ToListAsync(cancellationToken);

        foreach (var year in otherActiveYears)
        {
            year.IsActive = false;
        }
    }
}
