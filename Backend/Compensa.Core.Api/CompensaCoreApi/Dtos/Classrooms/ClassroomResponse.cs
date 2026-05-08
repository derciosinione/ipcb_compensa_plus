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
