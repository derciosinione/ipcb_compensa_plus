using System.ComponentModel.DataAnnotations;

namespace CompensaCoreApi.Dtos.Schedules;

/// <summary>Query to get all busy time slots for specific class groups on a given date.</summary>
public sealed class ClassGroupDayQuery
{
    [Required]
    public Guid AcademicYearId { get; init; }

    [Range(1, 2)]
    public int Semester { get; init; }

    [Required]
    public DateOnly Date { get; init; }

    /// <summary>Comma-separated class group IDs.</summary>
    public string ClassGroupIds { get; init; } = string.Empty;

    /// <summary>Optionally exclude a fixed schedule (e.g. the one being compensated).</summary>
    public Guid? ExcludedScheduleId { get; init; }

    /// <summary>Optionally include teacher user ID to check teacher availability too.</summary>
    public string? TeacherUserId { get; init; }
}

public sealed record ClassGroupDayResponse(
    IReadOnlyCollection<ClassGroupBusySlot> BusySlots,
    IReadOnlyCollection<string> FreeWindows);

public sealed record ClassGroupBusySlot(
    string StartTime,
    string EndTime,
    string Type);
