namespace CompensaIdentityApi.IntegrationEvents;

public record UserRegisteredEvent
{
    public required string UserId { get; init; }
    public required string Email { get; init; }
    public required string FullName { get; init; }
    public required DateTime RegisteredAt { get; init; }
}
