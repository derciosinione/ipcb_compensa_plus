using System.ComponentModel.DataAnnotations;

namespace CompensaCoreApi.Dtos.Assignments;

public sealed class SaveUserUnitAssignmentsRequest
{
    [Required]
    [EmailAddress]
    [MaxLength(256)]
    public string UserEmail { get; init; } = string.Empty;

    public IReadOnlyCollection<CourseAssignmentRequest> Courses { get; init; } = [];

    public IReadOnlyCollection<Guid> CurricularUnitIds { get; init; } = [];
}

public sealed record CourseAssignmentRequest(
    Guid CourseId,
    bool IsCoordinator);
