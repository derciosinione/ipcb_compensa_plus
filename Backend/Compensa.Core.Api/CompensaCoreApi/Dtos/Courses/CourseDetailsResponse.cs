namespace CompensaCoreApi.Dtos.Courses;

public sealed record CourseDetailsResponse(
    CourseResponse Course,
    IReadOnlyCollection<CurricularUnitResponse> Units,
    IReadOnlyCollection<ClassGroupResponse> Classes);
