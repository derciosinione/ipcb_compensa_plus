namespace CompensaCoreApi.Dtos.Courses;

public sealed record ClassGroupResponse(
    Guid Id,
    Guid CourseId,
    int Year,
    string Name,
    string TeacherId,
    bool IsActive);
