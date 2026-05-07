using CompensaCoreApi.Domain.CompensationRequests;

namespace CompensaCoreApi.Dtos.CompensationRequests;

public sealed record CompensationRequestResponse(
    Guid Id,
    string TeacherUserId,
    string TeacherName,
    string Course,
    string CurricularUnit,
    string[] YearGroups,
    TeachingComponentType ComponentType,
    DateOnly OriginalDate,
    TimeOnly OriginalStartTime,
    TimeOnly OriginalEndTime,
    string OriginalRoom,
    DateOnly NewDate,
    TimeOnly NewStartTime,
    TimeOnly NewEndTime,
    string NewRoom,
    string Justification,
    CompensationRequestStatus Status,
    string? DecisionComment,
    bool HasConflict,
    DateTimeOffset SubmittedAt,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
