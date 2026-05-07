using System.ComponentModel.DataAnnotations;
using CompensaCoreApi.Domain.CompensationRequests;

namespace CompensaCoreApi.Dtos.CompensationRequests;

public sealed class CreateCompensationRequestRequest
{
    [Required]
    public string TeacherUserId { get; init; } = string.Empty;

    [Required]
    public string TeacherName { get; init; } = string.Empty;

    [Required]
    public string Course { get; init; } = string.Empty;

    [Required]
    public string CurricularUnit { get; init; } = string.Empty;

    public string[] YearGroups { get; init; } = [];

    [Required]
    public TeachingComponentType ComponentType { get; init; }

    public DateOnly OriginalDate { get; init; }
    public TimeOnly OriginalStartTime { get; init; }
    public TimeOnly OriginalEndTime { get; init; }

    [Required]
    public string OriginalRoom { get; init; } = string.Empty;

    public DateOnly NewDate { get; init; }
    public TimeOnly NewStartTime { get; init; }
    public TimeOnly NewEndTime { get; init; }

    [Required]
    public string NewRoom { get; init; } = string.Empty;

    [Required]
    [MaxLength(2000)]
    public string Justification { get; init; } = string.Empty;
}
