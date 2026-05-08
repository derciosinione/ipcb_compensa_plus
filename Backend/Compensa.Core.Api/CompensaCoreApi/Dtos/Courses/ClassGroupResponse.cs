namespace CompensaCoreApi.Dtos.Courses;

public sealed record ClassGroupResponse(
    Guid Id,
    Guid CourseId,
    Guid CurricularUnitId,
    string Name,
    string TeacherId,
    bool IsActive);
