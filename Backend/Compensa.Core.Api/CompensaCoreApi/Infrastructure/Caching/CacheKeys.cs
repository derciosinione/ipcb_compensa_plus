namespace CompensaCoreApi.Infrastructure.Caching;

public static class CacheKeys
{
    public const string CourseListVersion = "courses:list_version";
    public const string DashboardSummary = "dashboard:summary";
    public const string AcademicYearsList = "academic_years:list";
    public const string AcademicYearsActive = "academic_years:active";

    public static string CourseList(string version, string? search, string userId, bool isCoordinator, bool isAdmin) 
        => $"courses:list:v{version}:{search ?? "all"}:{userId}:{isCoordinator}:{isAdmin}";

    public static string CourseDetails(Guid id, Guid academicYearId) => $"courses:details:{id}:{academicYearId}";
}
