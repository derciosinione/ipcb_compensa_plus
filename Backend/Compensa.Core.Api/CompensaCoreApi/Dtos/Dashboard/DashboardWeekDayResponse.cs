namespace CompensaCoreApi.Dtos.Dashboard;

public sealed record DashboardWeekDayResponse(
    int DayOfWeek,
    string Date,
    IReadOnlyCollection<DashboardScheduleEventResponse> Events);
