namespace CompensaCoreApi.Dtos.Dashboard;

public sealed record DashboardMetricResponse(
    int TotalRequests,
    int PendingRequests,
    int ApprovedRequests,
    int RejectedRequests,
    int ActiveCourses,
    int ActiveClassrooms,
    int ActiveClassGroups,
    int ClassCoveragePercent);
