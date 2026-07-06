using System.ComponentModel.DataAnnotations;

namespace CompensaCoreApi.Dtos.Courses;

public sealed class UpsertCurricularUnitRequest
{
    [Required]
    [StringLength(200, MinimumLength = 2)]
    public string Name { get; init; } = string.Empty;

    [StringLength(50)]
    public string? Abbreviation { get; init; }

    [Range(1, 10)]
    public int Year { get; init; }

    [Range(1, 2)]
    public int Semester { get; init; }

    [Range(1, 60)]
    public int Ects { get; init; }

    [Required]
    [StringLength(128, MinimumLength = 1)]
    public string ResponsibleTeacherId { get; init; } = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(256)]
    public string ResponsibleTeacherEmail { get; init; } = string.Empty;

    public bool IsActive { get; init; } = true;
}
