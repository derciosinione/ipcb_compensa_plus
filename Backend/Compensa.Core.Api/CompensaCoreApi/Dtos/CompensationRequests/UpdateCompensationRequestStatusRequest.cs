using System.ComponentModel.DataAnnotations;
using CompensaCoreApi.Domain.CompensationRequests;

namespace CompensaCoreApi.Dtos.CompensationRequests;

public sealed class UpdateCompensationRequestStatusRequest
{
    [Required]
    public CompensationRequestStatus Status { get; init; }

    [MaxLength(2000)]
    public string? DecisionComment { get; init; }
}
