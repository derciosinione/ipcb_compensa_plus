namespace CompensaCoreApi.Domain.Courses;

public sealed class CurricularUnit
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CourseId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Year { get; set; }
    public int Semester { get; set; }
    public int Ects { get; set; }
    public string[] TeacherIds { get; set; } = [];
    public string? RegentId { get; set; }
    public string? TheoreticalTeacherId { get; set; }
    public string? PracticalTeacherId { get; set; }
    public UnitComponentType Component { get; set; } = UnitComponentType.All;
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}
