using CompensaCoreApi.Dtos.Classrooms;

namespace CompensaCoreApi.Services.Classrooms;

public interface IClassroomService
{
    Task<IReadOnlyCollection<ClassroomResponse>> ListAsync(string? search, CancellationToken cancellationToken = default);
    Task<ClassroomResponse> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ClassroomResponse> CreateAsync(CreateClassroomRequest request, CancellationToken cancellationToken = default);
    Task<ClassroomResponse> UpdateAsync(Guid id, UpdateClassroomRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task DeleteBulkAsync(IEnumerable<Guid> ids, CancellationToken cancellationToken = default);
    Task<int> GetSchedulesCountAsync(Guid id, CancellationToken cancellationToken = default);
}
