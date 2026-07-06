using CompensaCoreApi.Domain.AcademicYears;

namespace CompensaCoreApi.Repositories.AcademicYears;

public interface IAcademicYearRepository
{
    Task<IReadOnlyCollection<AcademicYear>> ListAsync(CancellationToken cancellationToken = default);
    Task<AcademicYear?> GetActiveAsync(CancellationToken cancellationToken = default);
    Task<AcademicYear?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(AcademicYear academicYear, CancellationToken cancellationToken = default);
    Task UpdateAsync(AcademicYear academicYear, CancellationToken cancellationToken = default);
}
