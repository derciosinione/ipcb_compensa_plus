using System.ComponentModel.DataAnnotations;

namespace CompensaCoreApi.Dtos.Schedules;

public sealed class ScheduleAvailabilityQuery
{
    [Required]
    public Guid AcademicYearId { get; init; }

    [Range(1, 2)]
    public int Semester { get; init; }

    [Required]
    public DateOnly Date { get; init; }

    [Required]
    public TimeOnly StartTime { get; init; }

    [Required]
    public TimeOnly EndTime { get; init; }

    public Guid? ClassGroupId { get; init; }

    public Guid? ClassroomId { get; init; }

    public string? TeacherUserId { get; init; }

    public Guid? ExcludedScheduleId { get; init; }

    public Guid? ExcludedRequestId { get; init; }
}
