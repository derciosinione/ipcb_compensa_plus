using CompensaCoreApi.Domain.Courses;

namespace CompensaCoreApi.Repositories.Courses;

public interface ICourseRepository
{
    Task<IReadOnlyCollection<Course>> ListAsync(string? search, CancellationToken cancellationToken = default);
    Task<Course?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Course?> GetByAbbreviationAsync(string abbreviation, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<CurricularUnit>> ListUnitsAsync(Guid courseId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<ClassGroup>> ListClassGroupsAsync(Guid courseId, CancellationToken cancellationToken = default);
    Task AddAsync(Course course, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
    Task DeleteAsync(Course course, CancellationToken cancellationToken = default);
}
