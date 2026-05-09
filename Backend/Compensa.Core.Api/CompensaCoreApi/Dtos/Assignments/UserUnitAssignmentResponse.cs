namespace CompensaCoreApi.Dtos.Assignments;

public sealed record UserUnitAssignmentResponse(
    Guid Id,
    string UserId,
    string UserEmail,
    Guid CourseId,
    Guid CurricularUnitId,
    bool IsResponsible,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
