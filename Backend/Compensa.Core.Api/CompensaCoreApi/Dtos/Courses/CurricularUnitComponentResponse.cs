using CompensaCoreApi.Domain.Courses;

namespace CompensaCoreApi.Dtos.Courses;

public sealed record CurricularUnitComponentResponse(
    Guid Id,
    Guid CourseId,
    Guid CurricularUnitId,
    string Name,
    UnitComponentType Type,
    string ResponsibleTeacherId,
    string ResponsibleTeacherEmail,
    bool IsActive);
