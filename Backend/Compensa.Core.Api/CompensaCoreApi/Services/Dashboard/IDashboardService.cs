using CompensaCoreApi.Dtos.Dashboard;

namespace CompensaCoreApi.Services.Dashboard;

public interface IDashboardService
{
    Task<DashboardSummaryResponse> GetSummaryAsync(CancellationToken cancellationToken = default);
}
