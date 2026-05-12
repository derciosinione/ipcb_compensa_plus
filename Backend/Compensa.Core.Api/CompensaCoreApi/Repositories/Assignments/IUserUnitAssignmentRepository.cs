using CompensaCoreApi.Domain.Assignments;
using CompensaCoreApi.Domain.Courses;

namespace CompensaCoreApi.Repositories.Assignments;

public interface IUserUnitAssignmentRepository
{
    Task<IReadOnlyCollection<UserUnitAssignment>> ListByUserAsync(string userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<CourseTeacherAssignment>> ListCoursesByUserAsync(string userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<Course>> ListCoursesByIdsAsync(IReadOnlyCollection<Guid> courseIds, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<CurricularUnit>> ListUnitsByIdsAsync(IReadOnlyCollection<Guid> unitIds, CancellationToken cancellationToken = default);
    Task ReplaceUserAssignmentsAsync(
        string userId,
        IReadOnlyCollection<UserUnitAssignment> unitAssignments,
        IReadOnlyCollection<CourseTeacherAssignment> courseAssignments,
        CancellationToken cancellationToken = default);
    Task EnsureUserUnitAssignmentAsync(
        string userId,
        string userEmail,
        CurricularUnit unit,
        bool isResponsible,
        CancellationToken cancellationToken = default);
}
