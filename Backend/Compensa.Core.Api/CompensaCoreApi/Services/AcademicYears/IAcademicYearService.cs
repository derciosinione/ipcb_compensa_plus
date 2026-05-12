using CompensaCoreApi.Dtos.AcademicYears;

namespace CompensaCoreApi.Services.AcademicYears;

public interface IAcademicYearService
{
    Task<IReadOnlyCollection<AcademicYearResponse>> ListAsync(CancellationToken cancellationToken = default);
    Task<AcademicYearResponse> GetActiveAsync(CancellationToken cancellationToken = default);
}
