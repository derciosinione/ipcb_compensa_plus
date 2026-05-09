namespace CompensaCoreApi.Dtos.Assignments;

public sealed record UserAcademicAssignmentsResponse(
    IReadOnlyCollection<CourseTeacherAssignmentResponse> Courses,
    IReadOnlyCollection<UserUnitAssignmentResponse> Units);
