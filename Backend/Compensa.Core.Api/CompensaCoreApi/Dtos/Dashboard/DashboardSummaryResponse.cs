namespace CompensaCoreApi.Dtos.Dashboard;

public sealed record DashboardSummaryResponse(
    string? ActiveAcademicYear,
    DashboardMetricResponse Metrics,
    IReadOnlyCollection<DashboardTrendPointResponse> Trends,
    IReadOnlyCollection<DashboardWeekDayResponse> WeekSchedule);
