using CompensaCoreApi.Dtos.AcademicYears;

namespace CompensaCoreApi.Services.AcademicYears;

public interface IAcademicYearService
{
    Task<IReadOnlyCollection<AcademicYearResponse>> ListAsync(CancellationToken cancellationToken = default);
    Task<AcademicYearResponse> GetActiveAsync(CancellationToken cancellationToken = default);
    Task<AcademicYearResponse> CreateAsync(UpsertAcademicYearRequest request, CancellationToken cancellationToken = default);
    Task<AcademicYearResponse> UpdateAsync(Guid id, UpsertAcademicYearRequest request, CancellationToken cancellationToken = default);
    Task CopyOfferingsAsync(Guid fromYearId, Guid toYearId, CancellationToken cancellationToken = default);
}
