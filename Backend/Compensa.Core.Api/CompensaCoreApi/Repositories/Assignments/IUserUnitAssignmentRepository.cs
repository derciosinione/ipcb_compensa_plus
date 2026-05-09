using CompensaCoreApi.Domain.Assignments;
using CompensaCoreApi.Domain.Courses;

namespace CompensaCoreApi.Repositories.Assignments;

public interface IUserUnitAssignmentRepository
{
    Task<IReadOnlyCollection<UserUnitAssignment>> ListByUserAsync(string userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<CourseTeacherAssignment>> ListCoursesByUserAsync(string userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<CurricularUnit>> ListUnitsByIdsAsync(IReadOnlyCollection<Guid> unitIds, CancellationToken cancellationToken = default);
    Task ReplaceUserAssignmentsAsync(string userId, IReadOnlyCollection<UserUnitAssignment> assignments, CancellationToken cancellationToken = default);
}
