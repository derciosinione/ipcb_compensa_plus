using System.ComponentModel.DataAnnotations;

namespace CompensaCoreApi.Dtos.Courses;

public sealed class UpsertClassGroupRequest
{
    [Required]
    [Range(1, 10)]
    public int Year { get; init; }

    [Required]
    [StringLength(80, MinimumLength = 1)]
    public string Name { get; init; } = string.Empty;

    [StringLength(128)]
    public string TeacherId { get; init; } = string.Empty;

    [Required]
    public Guid AcademicYearId { get; init; }

    public bool IsActive { get; init; } = true;
}
