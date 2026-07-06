using System.ComponentModel.DataAnnotations;
using CompensaCoreApi.Domain.Courses;

namespace CompensaCoreApi.Dtos.Courses;

public sealed class UpsertClassScheduleRequest
{
    [Required]
    public Guid AcademicYearId { get; init; }

    [Required]
    public Guid CurricularUnitId { get; init; }

    [Range(1, 2)]
    public int Semester { get; init; }

    [Required]
    public UnitComponentType ComponentType { get; init; }

    [Range(0, 6)]
    public int DayOfWeek { get; init; }

    [Required]
    public TimeOnly StartTime { get; init; }

    [Required]
    public TimeOnly EndTime { get; init; }

    [Required]
    public Guid ClassroomId { get; init; }

    public bool IsActive { get; init; } = true;
}
