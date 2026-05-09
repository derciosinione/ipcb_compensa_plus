namespace CompensaCoreApi.Dtos.Assignments;

public sealed record CourseTeacherAssignmentResponse(
    Guid Id,
    string UserId,
    string UserEmail,
    Guid CourseId,
    bool IsCoordinator,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
