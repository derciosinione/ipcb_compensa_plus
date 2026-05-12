namespace CompensaCoreApi.Domain.Audit;

public sealed class AuditLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string EntityName { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty; // Create, Update, Delete, Approve, Reject
    public string ActorUserId { get; set; } = string.Empty;
    public string? PreviousState { get; set; } // JSON
    public string? NewState { get; set; } // JSON
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
