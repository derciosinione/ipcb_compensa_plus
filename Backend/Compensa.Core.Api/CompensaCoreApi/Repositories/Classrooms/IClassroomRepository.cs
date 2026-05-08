using CompensaCoreApi.Domain.Classrooms;

namespace CompensaCoreApi.Repositories.Classrooms;

public interface IClassroomRepository
{
    Task<IReadOnlyCollection<Classroom>> ListAsync(string? search, CancellationToken cancellationToken = default);
    Task<Classroom?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Classroom?> GetByNameAsync(string name, CancellationToken cancellationToken = default);
    Task AddAsync(Classroom classroom, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
    Task DeleteAsync(Classroom classroom, CancellationToken cancellationToken = default);
}
