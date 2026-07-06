using CompensaCoreApi.Domain.Classrooms;

namespace CompensaCoreApi.Dtos.Classrooms;

public sealed record ClassroomResponse(
    Guid Id,
    string Name,
    ClassroomType Type,
    int Capacity,
    string[] Features,
    bool IsActive,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);

public sealed record ClassroomUsageResponse(Guid ClassroomId, int AssociatedSchedulesCount);

public sealed record ClassroomsUsageBulkResponse(List<ClassroomUsageResponse> Usages);
