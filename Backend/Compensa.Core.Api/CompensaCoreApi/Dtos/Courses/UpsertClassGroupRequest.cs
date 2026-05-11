using System.ComponentModel.DataAnnotations;

namespace CompensaCoreApi.Dtos.Courses;

public sealed class UpsertClassGroupRequest
{
    [Required]
    public Guid CurricularUnitId { get; init; }

    [Required]
    [StringLength(80, MinimumLength = 1)]
    public string Name { get; init; } = string.Empty;

    [Required]
    [StringLength(128, MinimumLength = 1)]
    public string TeacherId { get; init; } = string.Empty;

    public bool IsActive { get; init; } = true;
}
