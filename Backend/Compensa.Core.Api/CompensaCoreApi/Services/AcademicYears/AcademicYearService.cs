using CompensaCoreApi.Domain.AcademicYears;
using CompensaCoreApi.Dtos.AcademicYears;
using CompensaCoreApi.Exceptions;
using CompensaCoreApi.Repositories.AcademicYears;
using CompensaCoreApi.Infrastructure.Caching;
using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;

namespace CompensaCoreApi.Services.AcademicYears;

public sealed class AcademicYearService : IAcademicYearService
{
    private readonly IAcademicYearRepository _repository;
    private readonly IDistributedCache _cache;

    public AcademicYearService(IAcademicYearRepository repository, IDistributedCache cache)
    {
        _repository = repository;
        _cache = cache;
    }

    public async Task<IReadOnlyCollection<AcademicYearResponse>> ListAsync(CancellationToken cancellationToken = default)
    {
        var cacheKey = CacheKeys.AcademicYearsList;
        var cachedData = await _cache.GetStringAsync(cacheKey, cancellationToken);
        if (!string.IsNullOrEmpty(cachedData))
        {
            return JsonSerializer.Deserialize<IReadOnlyCollection<AcademicYearResponse>>(cachedData)!;
        }

        var years = await _repository.ListAsync(cancellationToken);
        var result = years.Select(ToResponse).ToArray();

        await _cache.SetStringAsync(
            cacheKey,
            JsonSerializer.Serialize(result),
            new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1) },
            cancellationToken);

        return result;
    }

    public async Task<AcademicYearResponse> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        var cacheKey = CacheKeys.AcademicYearsActive;
        var cachedData = await _cache.GetStringAsync(cacheKey, cancellationToken);
        if (!string.IsNullOrEmpty(cachedData))
        {
            return JsonSerializer.Deserialize<AcademicYearResponse>(cachedData)!;
        }

        var activeYear = await _repository.GetActiveAsync(cancellationToken)
            ?? throw new NotFoundException("No active academic year was found.");

        var result = ToResponse(activeYear);

        await _cache.SetStringAsync(
            cacheKey,
            JsonSerializer.Serialize(result),
            new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1) },
            cancellationToken);

        return result;
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
