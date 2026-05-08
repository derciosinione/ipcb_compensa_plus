using System.ComponentModel.DataAnnotations;
using CompensaCoreApi.Domain.Courses;

namespace CompensaCoreApi.Dtos.Courses;

public sealed class CreateCourseRequest
{
    [Required]
    [StringLength(200, MinimumLength = 2)]
    public string Name { get; init; } = string.Empty;

    [Required]
    [StringLength(20, MinimumLength = 2)]
    public string Abbreviation { get; init; } = string.Empty;

    [Required]
    public CourseDegreeType Type { get; init; }

    [Required]
    [StringLength(1000, MinimumLength = 5)]
    public string Description { get; init; } = string.Empty;

    [Range(1, 10)]
    public int DurationYears { get; init; }

    [Range(1, 600)]
    public int TotalCredits { get; init; }

    [StringLength(128)]
    public string? CoordinatorUserId { get; init; }

    [StringLength(1000)]
    public string? ImageUrl { get; init; }

    public bool IsActive { get; init; } = true;
}
