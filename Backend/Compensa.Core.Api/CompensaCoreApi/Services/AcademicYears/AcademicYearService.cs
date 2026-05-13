using CompensaCoreApi.Domain.AcademicYears;
using CompensaCoreApi.Dtos.AcademicYears;
using CompensaCoreApi.Exceptions;
using CompensaCoreApi.Repositories.AcademicYears;
using CompensaCoreApi.Infrastructure.Caching;
using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;
using CompensaCoreApi.Repositories.Courses;
using CompensaCoreApi.Domain.Courses;

namespace CompensaCoreApi.Services.AcademicYears;

public sealed class AcademicYearService : IAcademicYearService
{
    private readonly IAcademicYearRepository _repository;
    private readonly ICourseRepository _courseRepository;
    private readonly IDistributedCache _cache;

    public AcademicYearService(
        IAcademicYearRepository repository, 
        ICourseRepository courseRepository,
        IDistributedCache cache)
    {
        _repository = repository;
        _courseRepository = courseRepository;
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

    public async Task<AcademicYearResponse> CreateAsync(UpsertAcademicYearRequest request, CancellationToken cancellationToken = default)
    {
        var academicYear = new AcademicYear
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            StartsOn = request.StartsOn,
            EndsOn = request.EndsOn,
            IsActive = request.IsActive
        };

        await _repository.AddAsync(academicYear, cancellationToken);
        await ClearCacheAsync(cancellationToken);

        return ToResponse(academicYear);
    }

    public async Task<AcademicYearResponse> UpdateAsync(Guid id, UpsertAcademicYearRequest request, CancellationToken cancellationToken = default)
    {
        var academicYear = await _repository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Academic year with ID {id} not found.");

        academicYear.Name = request.Name;
        academicYear.StartsOn = request.StartsOn;
        academicYear.EndsOn = request.EndsOn;
        academicYear.IsActive = request.IsActive;

        await _repository.UpdateAsync(academicYear, cancellationToken);
        await ClearCacheAsync(cancellationToken);

        return ToResponse(academicYear);
    }

    public async Task CopyOfferingsAsync(Guid fromYearId, Guid toYearId, CancellationToken cancellationToken = default)
    {
        // 1. Get all offerings from source year
        var courseOfferings = await _courseRepository.ListOfferingsAsync(fromYearId, cancellationToken);
        var unitOfferings = await _courseRepository.ListUnitOfferingsAsync(fromYearId, cancellationToken);

        // 2. Copy course offerings
        foreach (var offering in courseOfferings)
        {
            var newOffering = new CourseOffering
            {
                Id = Guid.NewGuid(),
                CourseId = offering.CourseId,
                AcademicYearId = toYearId,
                Description = offering.Description,
                CoordinatorUserId = offering.CoordinatorUserId,
                ImageUrl = offering.ImageUrl,
                IsActive = offering.IsActive
            };
            await _courseRepository.AddOfferingAsync(newOffering, cancellationToken);
        }

        // 3. Copy unit offerings
        foreach (var offering in unitOfferings)
        {
            var newOffering = new CurricularUnitOffering
            {
                Id = Guid.NewGuid(),
                CurricularUnitId = offering.CurricularUnitId,
                AcademicYearId = toYearId,
                ResponsibleTeacherId = offering.ResponsibleTeacherId,
                ResponsibleTeacherEmail = offering.ResponsibleTeacherEmail,
                IsActive = offering.IsActive
            };
            await _courseRepository.AddUnitOfferingAsync(newOffering, cancellationToken);
        }
    }

    private async Task ClearCacheAsync(CancellationToken cancellationToken)
    {
        await _cache.RemoveAsync(CacheKeys.AcademicYearsList, cancellationToken);
        await _cache.RemoveAsync(CacheKeys.AcademicYearsActive, cancellationToken);
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
