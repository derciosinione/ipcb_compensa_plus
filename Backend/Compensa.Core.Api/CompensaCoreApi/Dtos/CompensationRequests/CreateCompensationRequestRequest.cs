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
    public Guid AcademicYearId { get; init; }

    [Required]
    public Guid CourseId { get; init; }

    [Required]
    public Guid CurricularUnitId { get; init; }

    [Required]
    public Guid ClassGroupId { get; init; }

    [Required]
    public Guid OriginalClassScheduleId { get; init; }

    [Required]
    public Guid NewClassroomId { get; init; }

    [Required]
    public DateOnly OriginalDate { get; init; }

    public DateOnly NewDate { get; init; }
    public TimeOnly NewStartTime { get; init; }
    public TimeOnly NewEndTime { get; init; }

    [Required]
    [MaxLength(2000)]
    public string Justification { get; init; } = string.Empty;
}
