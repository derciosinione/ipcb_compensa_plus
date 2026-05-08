using CompensaCoreApi.Domain.Courses;

namespace CompensaCoreApi.Dtos.Courses;

public sealed record CourseResponse(
    Guid Id,
    string Name,
    string Abbreviation,
    CourseDegreeType Type,
    string Description,
    int DurationYears,
    int TotalCredits,
    string? CoordinatorUserId,
    string ImageUrl,
    bool IsActive,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
