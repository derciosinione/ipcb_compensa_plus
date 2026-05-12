namespace CompensaCoreApi.Domain.Courses;

public sealed class ClassSchedule
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CourseId { get; set; }
    public Guid CurricularUnitId { get; set; }
    public Guid ClassGroupId { get; set; }
    public Guid AcademicYearId { get; set; }
    public int Semester { get; set; }
    public UnitComponentType ComponentType { get; set; } = UnitComponentType.All;
    public int DayOfWeek { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public Guid ClassroomId { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}
