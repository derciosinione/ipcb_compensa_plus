namespace CompensaCoreApi.Dtos.Courses;

public sealed record CourseDetailsResponse(
    CourseResponse Course,
    IReadOnlyCollection<CurricularUnitResponse> Units,
    IReadOnlyCollection<CurricularUnitComponentResponse> Components,
    IReadOnlyCollection<ClassGroupResponse> Classes,
    IReadOnlyCollection<ClassScheduleResponse> Schedules);
