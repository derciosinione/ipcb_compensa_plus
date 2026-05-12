namespace CompensaCoreApi.IntegrationEvents;

public record RequestCreatedEvent
{
    public required Guid RequestId { get; init; }
    public required string TeacherUserId { get; init; }
    public required string TeacherName { get; init; }
    public required string CourseId { get; init; }
    public required string CoordinatorUserId { get; init; }
    public required DateTime SubmittedAt { get; init; }
}

public record RequestStatusUpdatedEvent
{
    public required Guid RequestId { get; init; }
    public required string TeacherUserId { get; init; }
    public required string CoordinatorUserId { get; init; }
    public required string UpdatedByUserId { get; init; }
    public required string Status { get; init; }
    public string? DecisionComment { get; init; }
}
