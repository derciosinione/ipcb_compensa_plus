using CompensaCoreApi.Domain.Courses;

namespace CompensaCoreApi.Dtos.Courses;

public sealed record CurricularUnitResponse(
    Guid Id,
    Guid CourseId,
    string Name,
    int Year,
    int Semester,
    int Ects,
    string[] TeacherIds,
    string? RegentId,
    string? TheoreticalTeacherId,
    string? PracticalTeacherId,
    UnitComponentType Component,
    bool IsActive);
