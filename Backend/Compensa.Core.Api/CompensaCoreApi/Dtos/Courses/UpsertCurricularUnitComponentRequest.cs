using System.ComponentModel.DataAnnotations;
using CompensaCoreApi.Domain.Courses;

namespace CompensaCoreApi.Dtos.Courses;

public sealed class UpsertCurricularUnitComponentRequest
{
    [Required]
    [StringLength(120, MinimumLength = 2)]
    public string Name { get; init; } = string.Empty;

    [Required]
    public UnitComponentType Type { get; init; }

    [Required]
    [StringLength(128, MinimumLength = 1)]
    public string ResponsibleTeacherId { get; init; } = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(256)]
    public string ResponsibleTeacherEmail { get; init; } = string.Empty;

    public bool IsActive { get; init; } = true;
}
