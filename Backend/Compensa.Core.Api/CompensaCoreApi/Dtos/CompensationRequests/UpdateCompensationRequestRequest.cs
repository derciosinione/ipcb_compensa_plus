using System.ComponentModel.DataAnnotations;

namespace CompensaCoreApi.Dtos.CompensationRequests;

public sealed class UpdateCompensationRequestRequest
{
    [Required]
    public Guid NewClassroomId { get; init; }

    [Required]
    public DateOnly NewDate { get; init; }

    [Required]
    public TimeOnly NewStartTime { get; init; }

    [Required]
    public TimeOnly NewEndTime { get; init; }

    [Required]
    [MaxLength(2000)]
    public string Justification { get; init; } = string.Empty;
}
