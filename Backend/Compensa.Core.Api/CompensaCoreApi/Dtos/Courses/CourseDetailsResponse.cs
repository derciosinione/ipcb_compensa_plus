namespace CompensaCoreApi.Dtos.Courses;

using CompensaCoreApi.Dtos.Assignments;

public sealed record CourseDetailsResponse(
    CourseResponse Course,
    IReadOnlyCollection<CurricularUnitResponse> Units,
    IReadOnlyCollection<CurricularUnitComponentResponse> Components,
    IReadOnlyCollection<ClassGroupResponse> Classes,
    IReadOnlyCollection<ClassScheduleResponse> Schedules,
    IReadOnlyCollection<CourseTeacherAssignmentResponse> CourseAssignments);
