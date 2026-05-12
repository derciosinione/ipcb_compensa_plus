using CompensaCoreApi.Data;
using CompensaCoreApi.Domain.CompensationRequests;
using CompensaCoreApi.Dtos.Dashboard;
using Microsoft.EntityFrameworkCore;
using CompensaCoreApi.Infrastructure.Caching;
using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;

namespace CompensaCoreApi.Services.Dashboard;

public sealed class DashboardService : IDashboardService
{
    private readonly CoreDbContext _dbContext;
    private readonly IDistributedCache _cache;

    public DashboardService(CoreDbContext dbContext, IDistributedCache cache)
    {
        _dbContext = dbContext;
        _cache = cache;
    }

    public async Task<DashboardSummaryResponse> GetSummaryAsync(CancellationToken cancellationToken = default)
    {
        var cacheKey = CacheKeys.DashboardSummary;
        var cachedData = await _cache.GetStringAsync(cacheKey, cancellationToken);
        if (!string.IsNullOrEmpty(cachedData))
        {
            return JsonSerializer.Deserialize<DashboardSummaryResponse>(cachedData)!;
        }

        var activeAcademicYear = await _dbContext.AcademicYears
            .AsNoTracking()
            .Where(academicYear => academicYear.IsActive)
            .OrderByDescending(academicYear => academicYear.StartsOn)
            .Select(academicYear => new { academicYear.Id, academicYear.Name })
            .FirstOrDefaultAsync(cancellationToken);

        var requests = _dbContext.CompensationRequests.AsNoTracking();
        var totalRequests = await requests.CountAsync(cancellationToken);
        var pendingRequests = await requests.CountAsync(
            request => request.Status == CompensationRequestStatus.Pending,
            cancellationToken);
        var approvedRequests = await requests.CountAsync(
            request => request.Status == CompensationRequestStatus.Approved,
            cancellationToken);
        var rejectedRequests = await requests.CountAsync(
            request => request.Status == CompensationRequestStatus.Rejected,
            cancellationToken);

        var activeCourses = await _dbContext.Courses
            .AsNoTracking()
            .CountAsync(course => course.IsActive, cancellationToken);
        var activeClassrooms = await _dbContext.Classrooms
            .AsNoTracking()
            .CountAsync(classroom => classroom.IsActive, cancellationToken);
        var activeClassGroups = await _dbContext.ClassGroups
            .AsNoTracking()
            .CountAsync(group => group.IsActive, cancellationToken);

        var scheduledClassGroups = await _dbContext.ClassSchedules
            .AsNoTracking()
            .Where(schedule => schedule.IsActive)
            .Select(schedule => schedule.ClassGroupId)
            .Distinct()
            .CountAsync(cancellationToken);

        var coveragePercent = activeClassGroups == 0
            ? 0
            : (int)Math.Round((double)scheduledClassGroups / activeClassGroups * 100);

        var metrics = new DashboardMetricResponse(
            totalRequests,
            pendingRequests,
            approvedRequests,
            rejectedRequests,
            activeCourses,
            activeClassrooms,
            activeClassGroups,
            coveragePercent);

        var trends = await BuildTrendAsync(cancellationToken);
        var weekSchedule = await BuildWeekScheduleAsync(activeAcademicYear?.Id, cancellationToken);

        var result = new DashboardSummaryResponse(activeAcademicYear?.Name, metrics, trends, weekSchedule);

        await _cache.SetStringAsync(
            cacheKey,
            JsonSerializer.Serialize(result),
            new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5) },
            cancellationToken);

        return result;
    }

    private async Task<IReadOnlyCollection<DashboardTrendPointResponse>> BuildTrendAsync(
        CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var months = Enumerable
            .Range(0, 6)
            .Select(offset => new DateOnly(now.Year, now.Month, 1).AddMonths(offset - 5))
            .ToArray();
        var firstMonth = months[0];

        var firstMonthStart = new DateTimeOffset(firstMonth.ToDateTime(TimeOnly.MinValue), TimeSpan.Zero);

        var requestData = await _dbContext.CompensationRequests
            .AsNoTracking()
            .Where(request => request.SubmittedAt >= firstMonthStart)
            .Select(request => new
            {
                request.SubmittedAt,
                request.Status
            })
            .ToListAsync(cancellationToken);

        return months
            .Select(month =>
            {
                var monthRequests = requestData
                    .Where(request => request.SubmittedAt.Year == month.Year && request.SubmittedAt.Month == month.Month)
                    .ToArray();

                return new DashboardTrendPointResponse(
                    month.ToString("MMM yyyy"),
                    monthRequests.Length,
                    monthRequests.Count(request => request.Status == CompensationRequestStatus.Approved),
                    monthRequests.Count(request => request.Status == CompensationRequestStatus.Rejected));
            })
            .ToArray();
    }

    private async Task<IReadOnlyCollection<DashboardWeekDayResponse>> BuildWeekScheduleAsync(
        Guid? activeAcademicYearId,
        CancellationToken cancellationToken)
    {
        var today = DateOnly.FromDateTime(DateTime.Today);
        var monday = today.AddDays(-GetMondayOffset(today.DayOfWeek));
        var weekDays = Enumerable.Range(0, 5).Select(offset => monday.AddDays(offset)).ToArray();

        var scheduleQuery =
            from schedule in _dbContext.ClassSchedules.AsNoTracking()
            join unit in _dbContext.CurricularUnits.AsNoTracking() on schedule.CurricularUnitId equals unit.Id
            join course in _dbContext.Courses.AsNoTracking() on schedule.CourseId equals course.Id
            join classGroup in _dbContext.ClassGroups.AsNoTracking() on schedule.ClassGroupId equals classGroup.Id
            join classroom in _dbContext.Classrooms.AsNoTracking() on schedule.ClassroomId equals classroom.Id
            where schedule.IsActive
            select new
            {
                schedule.Id,
                schedule.AcademicYearId,
                schedule.DayOfWeek,
                schedule.StartTime,
                schedule.EndTime,
                schedule.ComponentType,
                UnitName = unit.Name,
                CourseName = course.Name,
                ClassGroupName = classGroup.Name,
                ClassroomName = classroom.Name
            };

        if (activeAcademicYearId.HasValue)
        {
            scheduleQuery = scheduleQuery.Where(schedule => schedule.AcademicYearId == activeAcademicYearId.Value);
        }

        var schedules = await scheduleQuery
            .OrderBy(schedule => schedule.DayOfWeek)
            .ThenBy(schedule => schedule.StartTime)
            .ToListAsync(cancellationToken);

        return weekDays
            .Select(date =>
            {
                var dayOfWeek = ToIsoDayOfWeek(date.DayOfWeek);
                var events = schedules
                    .Where(schedule => schedule.DayOfWeek == dayOfWeek)
                    .Select(schedule => new DashboardScheduleEventResponse(
                        schedule.Id,
                        schedule.UnitName,
                        $"{schedule.StartTime:HH\\:mm} - {schedule.EndTime:HH\\:mm}",
                        schedule.ClassroomName,
                        schedule.CourseName,
                        schedule.ClassGroupName,
                        schedule.ComponentType.ToString()))
                    .ToArray();

                return new DashboardWeekDayResponse(dayOfWeek, date.ToString("yyyy-MM-dd"), events);
            })
            .ToArray();
    }

    private static int GetMondayOffset(DayOfWeek dayOfWeek)
    {
        return dayOfWeek == DayOfWeek.Sunday ? 6 : (int)dayOfWeek - 1;
    }

    private static int ToIsoDayOfWeek(DayOfWeek dayOfWeek)
    {
        return dayOfWeek == DayOfWeek.Sunday ? 7 : (int)dayOfWeek;
    }
}
