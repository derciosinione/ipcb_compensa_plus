using CompensaCoreApi.Domain.CompensationRequests;
using CompensaCoreApi.Dtos.CompensationRequests;

namespace CompensaCoreApi.Services.CompensationRequests;

public interface ICompensationRequestService
{
    Task<IReadOnlyCollection<CompensationRequestResponse>> ListAsync(
        CompensationRequestStatus? status,
        string? teacherUserId,
        CancellationToken cancellationToken = default);

    Task<CompensationRequestResponse> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<CompensationRequestResponse> CreateAsync(
        CreateCompensationRequestRequest request,
        string actorUserId,
        bool canCreateForOthers,
        CancellationToken cancellationToken = default);

    Task<CompensationRequestResponse> UpdateStatusAsync(
        Guid id,
        UpdateCompensationRequestStatusRequest request,
        string actorUserId,
        bool isCoordinator,
        bool isAdmin,
        CancellationToken cancellationToken = default);
}
