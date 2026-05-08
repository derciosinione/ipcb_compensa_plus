namespace CompensaCoreApi.Domain.Courses;

public sealed class ClassGroup
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CourseId { get; set; }
    public Guid CurricularUnitId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string TeacherId { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}
