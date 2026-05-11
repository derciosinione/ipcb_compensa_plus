using CompensaCoreApi.Domain.Courses;

namespace CompensaCoreApi.Dtos.Courses;

public sealed record ClassScheduleResponse(
    Guid Id,
    Guid CourseId,
    Guid CurricularUnitId,
    Guid ClassGroupId,
    Guid AcademicYearId,
    int Semester,
    UnitComponentType ComponentType,
    int DayOfWeek,
    TimeOnly StartTime,
    TimeOnly EndTime,
    Guid ClassroomId,
    bool IsActive);
