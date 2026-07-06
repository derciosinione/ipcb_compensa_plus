using System;

namespace CompensaCoreApi.Domain.CompensationRequests;

public sealed class CompensationRequestComment
{
    public Guid Id { get; set; }
    public Guid CompensationRequestId { get; set; }
    
    public string AuthorUserId { get; set; } = string.Empty;
    public string AuthorName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Text { get; set; } = string.Empty;
    
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    // Navigation property
    public CompensationRequest CompensationRequest { get; set; } = null!;
}
