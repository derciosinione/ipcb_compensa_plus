namespace CompensaCoreApi.Domain.Assignments;

public sealed class UserUnitAssignment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string UserId { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public Guid CourseId { get; set; }
    public Guid CurricularUnitId { get; set; }
    public bool IsResponsible { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}
