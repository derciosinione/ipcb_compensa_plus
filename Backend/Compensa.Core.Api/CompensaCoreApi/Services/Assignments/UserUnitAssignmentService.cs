using System.Collections.Generic;
using System.Linq;
using CompensaCoreApi.Domain.Assignments;
using CompensaCoreApi.Domain.Courses;
using CompensaCoreApi.Dtos.Assignments;
using CompensaCoreApi.Repositories.Assignments;
using CompensaCoreApi.Repositories.Courses;
using CompensaCoreApi.Repositories.AcademicYears;
using CompensaCoreApi.Infrastructure.Caching;
using Microsoft.Extensions.Caching.Distributed;

namespace CompensaCoreApi.Services.Assignments;

public sealed class UserUnitAssignmentService : IUserUnitAssignmentService
{
    private readonly IUserUnitAssignmentRepository _repository;
    private readonly ICourseRepository _courseRepository;
    private readonly IAcademicYearRepository _academicYearRepository;
    private readonly IDistributedCache _cache;

    public UserUnitAssignmentService(
        IUserUnitAssignmentRepository repository,
        ICourseRepository courseRepository,
        IAcademicYearRepository academicYearRepository,
        IDistributedCache cache)
    {
        _repository = repository;
        _courseRepository = courseRepository;
        _academicYearRepository = academicYearRepository;
        _cache = cache;
    }

    public async Task<UserAcademicAssignmentsResponse> ListByUserAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        var unitAssignments = await _repository.ListByUserAsync(userId, cancellationToken: cancellationToken);
        var courseAssignments = await _repository.ListCoursesByUserAsync(userId, cancellationToken: cancellationToken);

        var courseIds = courseAssignments.Select(c => c.CourseId)
            .Concat(unitAssignments.Select(u => u.CourseId))
            .Distinct()
            .ToArray();
        
        var unitIds = unitAssignments.Select(u => u.CurricularUnitId).Distinct().ToArray();

        var courses = await _repository.ListCoursesByIdsAsync(courseIds, cancellationToken);
        var units = await _repository.ListUnitsByIdsAsync(unitIds, cancellationToken);

        var courseNames = courses.ToDictionary(c => c.Id, c => c.Name);
        var unitNames = units.ToDictionary(u => u.Id, u => u.Name);

        return new UserAcademicAssignmentsResponse(
            courseAssignments.Select(c => ToCourseResponse(c, courseNames.ContainsKey(c.CourseId) ? courseNames[c.CourseId] : "Unknown")).ToArray(),
            unitAssignments.Select(u => ToUnitResponse(u, 
                courseNames.ContainsKey(u.CourseId) ? courseNames[u.CourseId] : "Unknown", 
                unitNames.ContainsKey(u.CurricularUnitId) ? unitNames[u.CurricularUnitId] : "Unknown")).ToArray());
    }

    public async Task<UserAcademicAssignmentsResponse> SaveAsync(
        string userId,
        SaveUserUnitAssignmentsRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
            throw new InvalidOperationException("User id is required.");

        var normalizedUserId = userId.Trim();
        var normalizedEmail = request.UserEmail.Trim().ToLowerInvariant();
        var unitIds = request.CurricularUnitIds.Distinct().ToArray();
        var units = await _repository.ListUnitsByIdsAsync(unitIds, cancellationToken);

        if (units.Count != unitIds.Length)
            throw new InvalidOperationException("One or more curricular units do not exist.");

        var requestedCourseIds = request.Courses
            .Select(assignment => assignment.CourseId)
            .Concat(units.Select(unit => unit.CourseId))
            .Distinct()
            .ToArray();
        var courses = await _repository.ListCoursesByIdsAsync(requestedCourseIds, cancellationToken);

        if (courses.Count != requestedCourseIds.Length)
            throw new InvalidOperationException("One or more courses do not exist.");

        var activeYear = await _academicYearRepository.GetActiveAsync(cancellationToken);
        var unitOfferings = activeYear != null
            ? await _courseRepository.ListUnitOfferingsAsync(unitIds, activeYear.Id, cancellationToken)
            : new List<CurricularUnitOffering>();

        var now = DateTimeOffset.UtcNow;
        var unitAssignments = units
            .Select(unit =>
            {
                var offering = unitOfferings.FirstOrDefault(o => o.CurricularUnitId == unit.Id);
                return new UserUnitAssignment
                {
                    UserId = normalizedUserId,
                    UserEmail = normalizedEmail,
                    CourseId = unit.CourseId,
                    CurricularUnitId = unit.Id,
                    IsResponsible = offering?.ResponsibleTeacherId == normalizedUserId,
                    CreatedAt = now,
                    UpdatedAt = now
                };
            })
            .ToArray();

        var coordinatorCourseIds = request.Courses
            .Where(assignment => assignment.IsCoordinator)
            .Select(assignment => assignment.CourseId)
            .ToHashSet();

        var courseAssignments = requestedCourseIds
            .Select(courseId => new CourseTeacherAssignment
            {
                UserId = normalizedUserId,
                UserEmail = normalizedEmail,
                CourseId = courseId,
                IsCoordinator = coordinatorCourseIds.Contains(courseId),
                CreatedAt = now,
                UpdatedAt = now
            })
            .ToArray();

        await _repository.ReplaceUserAssignmentsAsync(normalizedUserId, unitAssignments, courseAssignments, cancellationToken);

        // Invalidate caches in Redis
        try
        {
            var versionStr = await _cache.GetStringAsync(CacheKeys.CourseListVersion, cancellationToken) ?? "0";
            var nextVersion = (int.TryParse(versionStr, out var v) ? v : 0) + 1;
            await _cache.SetStringAsync(CacheKeys.CourseListVersion, nextVersion.ToString(), cancellationToken);

            var dashVersionStr = await _cache.GetStringAsync(CacheKeys.DashboardSummaryVersion, cancellationToken) ?? "0";
            var nextDashVersion = (int.TryParse(dashVersionStr, out var dv) ? dv : 0) + 1;
            await _cache.SetStringAsync(CacheKeys.DashboardSummaryVersion, nextDashVersion.ToString(), cancellationToken);

            if (activeYear != null)
            {
                foreach (var courseId in requestedCourseIds)
                {
                    await _cache.RemoveAsync(CacheKeys.CourseDetails(courseId, activeYear.Id), cancellationToken);
                }
            }
        }
        catch (System.Exception)
        {
            // Do not fail user assignment save if cache invalidation fails
        }

        return await ListByUserAsync(normalizedUserId, cancellationToken);
    }

    private static UserUnitAssignmentResponse ToUnitResponse(UserUnitAssignment assignment, string courseName, string unitName)
    {
        return new UserUnitAssignmentResponse(
            assignment.Id,
            assignment.UserId,
            assignment.UserEmail,
            assignment.CourseId,
            courseName,
            assignment.CurricularUnitId,
            unitName,
            assignment.IsResponsible,
            assignment.CreatedAt,
            assignment.UpdatedAt);
    }

    private static CourseTeacherAssignmentResponse ToCourseResponse(CourseTeacherAssignment assignment, string courseName)
    {
        return new CourseTeacherAssignmentResponse(
            assignment.Id,
            assignment.UserId,
            assignment.UserEmail,
            assignment.CourseId,
            courseName,
            assignment.IsCoordinator,
            assignment.CreatedAt,
            assignment.UpdatedAt);
    }
}
