namespace CompensaCoreApi.Dtos.Dashboard;

public sealed record DashboardScheduleEventResponse(
    Guid Id,
    string Title,
    string Time,
    string Room,
    string Course,
    string ClassGroup,
    string Type);
