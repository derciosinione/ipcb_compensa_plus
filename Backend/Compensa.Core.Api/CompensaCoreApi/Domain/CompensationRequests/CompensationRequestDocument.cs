namespace CompensaCoreApi.Domain.CompensationRequests;

public sealed class CompensationRequestDocument
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CompensationRequestId { get; set; }
    
    public string FileName { get; set; } = string.Empty;
    public string StoredFileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long SizeInBytes { get; set; }
    
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    // Navigation property
    public CompensationRequest CompensationRequest { get; set; } = null!;
}
