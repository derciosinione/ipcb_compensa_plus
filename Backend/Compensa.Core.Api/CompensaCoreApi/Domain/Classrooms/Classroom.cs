namespace CompensaCoreApi.Domain.Classrooms;

public sealed class Classroom
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public ClassroomType Type { get; set; }
    public int Capacity { get; set; }
    public string[] Features { get; set; } = [];
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}
