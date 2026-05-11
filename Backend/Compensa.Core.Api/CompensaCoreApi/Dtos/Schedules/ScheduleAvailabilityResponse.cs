namespace CompensaCoreApi.Dtos.Schedules;

public sealed record ScheduleAvailabilityResponse(
    bool IsAvailable,
    IReadOnlyCollection<ScheduleConflictResponse> Conflicts);

public sealed record ScheduleConflictResponse(
    string Type,
    string Message,
    Guid? ScheduleId,
    Guid? CompensationRequestId);
