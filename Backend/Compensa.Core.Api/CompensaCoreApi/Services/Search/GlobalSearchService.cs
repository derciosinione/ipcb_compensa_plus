using CompensaCoreApi.Data;
using CompensaCoreApi.Dtos.Search;
using Microsoft.EntityFrameworkCore;

namespace CompensaCoreApi.Services.Search;

public sealed class GlobalSearchService : IGlobalSearchService
{
    private const int ResultLimit = 8;
    private readonly CoreDbContext _dbContext;

    public GlobalSearchService(CoreDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyCollection<GlobalSearchResultResponse>> SearchAsync(
        string query,
        string actorUserId,
        bool isCoordinator,
        bool isAdmin,
        CancellationToken cancellationToken = default)
    {
        var normalizedQuery = query.Trim();
        if (normalizedQuery.Length < 2)
            return Array.Empty<GlobalSearchResultResponse>();

        var likeQuery = $"%{normalizedQuery}%";
        var results = new List<GlobalSearchResultResponse>();

        results.AddRange(await SearchCoursesAsync(likeQuery, actorUserId, isCoordinator, isAdmin, cancellationToken));
        results.AddRange(await SearchUnitsAsync(likeQuery, cancellationToken));
        results.AddRange(await SearchClassGroupsAsync(likeQuery, cancellationToken));
        results.AddRange(await SearchClassroomsAsync(likeQuery, cancellationToken));
        results.AddRange(await SearchRequestsAsync(likeQuery, actorUserId, isCoordinator, isAdmin, cancellationToken));

        return results
            .OrderBy(result => GetTypeOrder(result.Type))
            .ThenBy(result => result.Title)
            .Take(25)
            .ToArray();
    }

    private async Task<IReadOnlyCollection<GlobalSearchResultResponse>> SearchCoursesAsync(
        string likeQuery,
        string actorUserId,
        bool isCoordinator,
        bool isAdmin,
        CancellationToken cancellationToken)
    {
        var query = _dbContext.Courses.AsNoTracking();

        // Security check: Teachers only see their assigned courses
        if (!isAdmin && !isCoordinator)
        {
            var assignedCourseIds = await _dbContext.UserUnitAssignments
                .AsNoTracking()
                .Where(a => a.UserId == actorUserId)
                .Select(a => a.CourseId)
                .Distinct()
                .ToListAsync(cancellationToken);

            query = query.Where(course => assignedCourseIds.Contains(course.Id));
        }

        var courses = await query
            .Where(course =>
                EF.Functions.ILike(course.Name, likeQuery) ||
                EF.Functions.ILike(course.Abbreviation, likeQuery))
            .OrderBy(course => course.Name)
            .Take(ResultLimit)
            .Select(course => new
            {
                course.Id,
                course.Name,
                course.Abbreviation,
                course.Type
            })
            .ToListAsync(cancellationToken);

        return courses
            .Select(course => new GlobalSearchResultResponse(
                course.Id.ToString(),
                "course",
                course.Name,
                $"{course.Abbreviation} · {course.Type}",
                $"/courses/{course.Id}"))
            .ToArray();
    }

    private async Task<IReadOnlyCollection<GlobalSearchResultResponse>> SearchUnitsAsync(
        string likeQuery,
        CancellationToken cancellationToken)
    {
        var units = await (
                from unit in _dbContext.CurricularUnits.AsNoTracking()
                join course in _dbContext.Courses.AsNoTracking() on unit.CourseId equals course.Id
                where EF.Functions.ILike(unit.Name, likeQuery)
                orderby unit.Name
                select new
                {
                    unit.Id,
                    unit.Name,
                    unit.Year,
                    unit.Semester,
                    CourseId = course.Id,
                    course.Abbreviation
                })
            .Take(ResultLimit)
            .ToListAsync(cancellationToken);

        return units
            .Select(unit => new GlobalSearchResultResponse(
                unit.Id.ToString(),
                "unit",
                unit.Name,
                $"{unit.Abbreviation} · Year {unit.Year} · Semester {unit.Semester}",
                $"/courses/{unit.CourseId}"))
            .ToArray();
    }

    private async Task<IReadOnlyCollection<GlobalSearchResultResponse>> SearchClassGroupsAsync(
        string likeQuery,
        CancellationToken cancellationToken)
    {
        var classGroups = await (
                from classGroup in _dbContext.ClassGroups.AsNoTracking()
                join course in _dbContext.Courses.AsNoTracking() on classGroup.CourseId equals course.Id
                where EF.Functions.ILike(classGroup.Name, likeQuery)
                orderby classGroup.Name
                select new
                {
                    classGroup.Id,
                    classGroup.Name,
                    classGroup.Year,
                    CourseId = course.Id,
                    course.Abbreviation
                })
            .Take(ResultLimit)
            .ToListAsync(cancellationToken);

        return classGroups
            .Select(classGroup => new GlobalSearchResultResponse(
                classGroup.Id.ToString(),
                "class",
                classGroup.Name,
                $"{classGroup.Abbreviation} · Year {classGroup.Year}",
                $"/courses/{classGroup.CourseId}"))
            .ToArray();
    }

    private async Task<IReadOnlyCollection<GlobalSearchResultResponse>> SearchClassroomsAsync(
        string likeQuery,
        CancellationToken cancellationToken)
    {
        var classrooms = await _dbContext.Classrooms
            .AsNoTracking()
            .Where(classroom => EF.Functions.ILike(classroom.Name, likeQuery))
            .OrderBy(classroom => classroom.Name)
            .Take(ResultLimit)
            .Select(classroom => new
            {
                classroom.Id,
                classroom.Name,
                classroom.Type,
                classroom.Capacity
            })
            .ToListAsync(cancellationToken);

        return classrooms
            .Select(classroom => new GlobalSearchResultResponse(
                classroom.Id.ToString(),
                "room",
                classroom.Name,
                $"{classroom.Type} · {classroom.Capacity} seats",
                "/classrooms"))
            .ToArray();
    }

    private async Task<IReadOnlyCollection<GlobalSearchResultResponse>> SearchRequestsAsync(
        string likeQuery,
        string actorUserId,
        bool isCoordinator,
        bool isAdmin,
        CancellationToken cancellationToken)
    {
        var query = _dbContext.CompensationRequests.AsNoTracking();

        // Security check: Teachers only search their own requests
        if (!isAdmin && !isCoordinator)
        {
            query = query.Where(request => request.TeacherUserId == actorUserId);
        }

        var requests = await query
            .Where(request =>
                EF.Functions.ILike(request.Course, likeQuery) ||
                EF.Functions.ILike(request.CurricularUnit, likeQuery) ||
                EF.Functions.ILike(request.TeacherName, likeQuery) ||
                EF.Functions.ILike(request.Justification, likeQuery))
            .OrderByDescending(request => request.SubmittedAt)
            .Take(ResultLimit)
            .Select(request => new
            {
                request.Id,
                request.CurricularUnit,
                request.Status,
                request.TeacherName
            })
            .ToListAsync(cancellationToken);

        return requests
            .Select(request => new GlobalSearchResultResponse(
                request.Id.ToString(),
                "request",
                request.CurricularUnit,
                $"{request.Status} · {request.TeacherName}",
                "/requests"))
            .ToArray();
    }

    private static int GetTypeOrder(string type)
    {
        return type switch
        {
            "course" => 1,
            "unit" => 2,
            "class" => 3,
            "room" => 4,
            "request" => 5,
            _ => 9
        };
    }
}
