namespace CompensaCoreApi.Domain.Courses;

public sealed class CurricularUnit
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CourseId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Year { get; set; }
    public int Semester { get; set; }
    public int Ects { get; set; }
    public string ResponsibleTeacherId { get; set; } = string.Empty;
    public string ResponsibleTeacherEmail { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}
