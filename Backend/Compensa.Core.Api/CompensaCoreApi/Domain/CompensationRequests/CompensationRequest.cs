namespace CompensaCoreApi.Domain.CompensationRequests;

public sealed class CompensationRequest
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string TeacherUserId { get; set; } = string.Empty;
    public string TeacherName { get; set; } = string.Empty;

    public Guid? AcademicYearId { get; set; }
    public int Semester { get; set; }
    public Guid? CourseId { get; set; }
    public Guid? CurricularUnitId { get; set; }
    public Guid? ClassGroupId { get; set; }
    public Guid? OriginalClassScheduleId { get; set; }
    public Guid? OriginalClassroomId { get; set; }
    public Guid? NewClassroomId { get; set; }

    public string Course { get; set; } = string.Empty;
    public string CurricularUnit { get; set; } = string.Empty;
    public string[] YearGroups { get; set; } = [];
    public TeachingComponentType ComponentType { get; set; }

    public DateOnly OriginalDate { get; set; }
    public TimeOnly OriginalStartTime { get; set; }
    public TimeOnly OriginalEndTime { get; set; }
    public string OriginalRoom { get; set; } = string.Empty;

    public DateOnly NewDate { get; set; }
    public TimeOnly NewStartTime { get; set; }
    public TimeOnly NewEndTime { get; set; }
    public string NewRoom { get; set; } = string.Empty;

    public string Justification { get; set; } = string.Empty;
    public CompensationRequestStatus Status { get; set; } = CompensationRequestStatus.Pending;
    public string? DecisionComment { get; set; }
    public bool HasConflict { get; set; }

    public DateTimeOffset SubmittedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    
    public ICollection<CompensationRequestDocument> Documents { get; set; } = [];
}
