using CompensaCoreApi.Dtos.Dashboard;

namespace CompensaCoreApi.Services.Dashboard;

public interface IDashboardService
{
    Task<DashboardSummaryResponse> GetSummaryAsync(
        string actorUserId,
        bool isCoordinator,
        bool isAdmin,
        CancellationToken cancellationToken = default);
}
