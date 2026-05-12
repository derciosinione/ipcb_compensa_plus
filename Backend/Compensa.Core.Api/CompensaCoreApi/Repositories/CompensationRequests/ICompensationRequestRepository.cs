using CompensaCoreApi.Domain.CompensationRequests;

namespace CompensaCoreApi.Repositories.CompensationRequests;

public interface ICompensationRequestRepository
{
    Task<IReadOnlyCollection<CompensationRequest>> ListAsync(
        CompensationRequestStatus? status,
        string? teacherUserId,
        CancellationToken cancellationToken = default);

    Task<CompensationRequest?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<CompensationRequest>> ListOverlappingActiveAsync(
        Guid academicYearId,
        int semester,
        DateOnly date,
        TimeOnly startTime,
        TimeOnly endTime,
        Guid? excludedRequestId,
        CancellationToken cancellationToken = default);

    Task AddAsync(CompensationRequest request, CancellationToken cancellationToken = default);

    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
