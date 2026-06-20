using System.ComponentModel.DataAnnotations;

namespace CompensaCoreApi.Dtos.Schedules;

/// <summary>Query parameters for bulk classroom availability check.</summary>
public sealed class RoomsAvailabilityQuery
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

    /// <summary>Optional: exclude a specific fixed schedule from conflict checks (the one being compensated).</summary>
    public Guid? ExcludedScheduleId { get; init; }
}

/// <summary>Availability status of a single classroom for a requested time slot.</summary>
public sealed record ClassroomAvailabilityItem(
    Guid ClassroomId,
    string ClassroomName,
    bool IsAvailable,
    /// <summary>When occupied, describes what is booked and at what times.</summary>
    string? ConflictInfo);
