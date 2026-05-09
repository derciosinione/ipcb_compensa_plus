using CompensaCoreApi.Domain.Assignments;
using CompensaCoreApi.Dtos.Assignments;
using CompensaCoreApi.Repositories.Assignments;

namespace CompensaCoreApi.Services.Assignments;

public sealed class UserUnitAssignmentService : IUserUnitAssignmentService
{
    private readonly IUserUnitAssignmentRepository _repository;

    public UserUnitAssignmentService(IUserUnitAssignmentRepository repository)
    {
        _repository = repository;
    }

    public async Task<UserAcademicAssignmentsResponse> ListByUserAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        var unitAssignments = await _repository.ListByUserAsync(userId, cancellationToken);
        var courseAssignments = await _repository.ListCoursesByUserAsync(userId, cancellationToken);

        return new UserAcademicAssignmentsResponse(
            courseAssignments.Select(ToCourseResponse).ToArray(),
            unitAssignments.Select(ToUnitResponse).ToArray());
    }

    public async Task<UserAcademicAssignmentsResponse> SaveAsync(
        string userId,
        SaveUserUnitAssignmentsRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
            throw new InvalidOperationException("User id is required.");

        var unitIds = request.CurricularUnitIds.Distinct().ToArray();
        var units = await _repository.ListUnitsByIdsAsync(unitIds, cancellationToken);

        if (units.Count != unitIds.Length)
            throw new InvalidOperationException("One or more curricular units do not exist.");

        var now = DateTimeOffset.UtcNow;
        var assignments = units
            .Select(unit => new UserUnitAssignment
            {
                UserId = userId.Trim(),
                UserEmail = request.UserEmail.Trim(),
                CourseId = unit.CourseId,
                CurricularUnitId = unit.Id,
                IsResponsible = unit.ResponsibleTeacherId == userId.Trim(),
                CreatedAt = now,
                UpdatedAt = now
            })
            .ToArray();

        await _repository.ReplaceUserAssignmentsAsync(userId.Trim(), assignments, cancellationToken);

        return await ListByUserAsync(userId.Trim(), cancellationToken);
    }

    private static UserUnitAssignmentResponse ToUnitResponse(UserUnitAssignment assignment)
    {
        return new UserUnitAssignmentResponse(
            assignment.Id,
            assignment.UserId,
            assignment.UserEmail,
            assignment.CourseId,
            assignment.CurricularUnitId,
            assignment.IsResponsible,
            assignment.CreatedAt,
            assignment.UpdatedAt);
    }

    private static CourseTeacherAssignmentResponse ToCourseResponse(CourseTeacherAssignment assignment)
    {
        return new CourseTeacherAssignmentResponse(
            assignment.Id,
            assignment.UserId,
            assignment.UserEmail,
            assignment.CourseId,
            assignment.IsCoordinator,
            assignment.CreatedAt,
            assignment.UpdatedAt);
    }
}
