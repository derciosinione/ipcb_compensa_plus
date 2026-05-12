using CompensaCoreApi.Domain.CompensationRequests;
using CompensaCoreApi.Dtos.CompensationRequests;

namespace CompensaCoreApi.Services.CompensationRequests;

public interface ICompensationRequestService
{
    Task<IReadOnlyCollection<CompensationRequestResponse>> ListAsync(
        CompensationRequestStatus? status,
        string? teacherUserId,
        string actorUserId,
        bool isCoordinator,
        bool isAdmin,
        CancellationToken cancellationToken = default);

    Task<CompensationRequestResponse> GetByIdAsync(
        Guid id,
        string actorUserId,
        bool isCoordinator,
        bool isAdmin,
        CancellationToken cancellationToken = default);

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
