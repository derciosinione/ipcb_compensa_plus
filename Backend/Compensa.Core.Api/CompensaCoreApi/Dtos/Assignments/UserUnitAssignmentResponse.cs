namespace CompensaCoreApi.Dtos.Assignments;

public sealed record UserUnitAssignmentResponse(
    Guid Id,
    string UserId,
    string UserEmail,
    Guid CourseId,
    string CourseName,
    Guid CurricularUnitId,
    string CurricularUnitName,
    bool IsResponsible,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
