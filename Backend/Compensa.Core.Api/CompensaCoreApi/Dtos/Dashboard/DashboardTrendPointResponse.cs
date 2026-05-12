namespace CompensaCoreApi.Dtos.Dashboard;

public sealed record DashboardTrendPointResponse(
    string Period,
    int Total,
    int Approved,
    int Rejected);
