using CompensaCoreApi.Domain.AcademicYears;
using CompensaCoreApi.Dtos.AcademicYears;
using CompensaCoreApi.Exceptions;
using CompensaCoreApi.Repositories.AcademicYears;

namespace CompensaCoreApi.Services.AcademicYears;

public sealed class AcademicYearService : IAcademicYearService
{
    private readonly IAcademicYearRepository _repository;

    public AcademicYearService(IAcademicYearRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyCollection<AcademicYearResponse>> ListAsync(CancellationToken cancellationToken = default)
    {
        var years = await _repository.ListAsync(cancellationToken);
        return years.Select(ToResponse).ToArray();
    }

    public async Task<AcademicYearResponse> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        var activeYear = await _repository.GetActiveAsync(cancellationToken)
            ?? throw new NotFoundException("No active academic year was found.");

        return ToResponse(activeYear);
    }

    private static AcademicYearResponse ToResponse(AcademicYear academicYear)
    {
        return new AcademicYearResponse(
            academicYear.Id,
            academicYear.Name,
            academicYear.StartsOn,
            academicYear.EndsOn,
            academicYear.IsActive);
    }
}
