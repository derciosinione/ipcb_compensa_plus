using CompensaCoreApi.Domain.CompensationRequests;

namespace CompensaCoreApi.Repositories.CompensationRequests;

public interface ICompensationRequestRepository
{
    Task<IReadOnlyCollection<CompensationRequest>> ListAsync(
        CompensationRequestStatus? status,
        string? teacherUserId,
        CancellationToken cancellationToken = default);

    Task<CompensationRequest?> GetByIdAsync(Guid id, bool includeDocuments = false, CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<CompensationRequest>> ListOverlappingActiveAsync(
        Guid academicYearId,
        int semester,
        DateOnly date,
        TimeOnly startTime,
        TimeOnly endTime,
        Guid? excludedRequestId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<CompensationRequest>> ListActiveForClassGroupsOnDateAsync(
        IReadOnlyCollection<Guid> classGroupIds,
        DateOnly date,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<CompensationRequest>> ListActiveForTeacherOnDateAsync(
        string teacherUserId,
        DateOnly date,
        CancellationToken cancellationToken = default);

    Task AddAsync(CompensationRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(CompensationRequest request, CancellationToken cancellationToken = default);

    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
