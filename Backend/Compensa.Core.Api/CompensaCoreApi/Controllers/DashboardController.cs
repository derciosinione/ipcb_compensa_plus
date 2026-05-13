using CompensaCoreApi.Contracts;
using CompensaCoreApi.Dtos.Dashboard;
using CompensaCoreApi.Services.Dashboard;
using CompensaCoreApi.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CompensaCoreApi.Controllers;

[ApiController]
[Authorize(Roles = "Teacher,Coordinator,Admin")]
[Route("api/dashboard")]
public sealed class DashboardController : ControllerBase
{
    private readonly IDashboardService _service;

    public DashboardController(IDashboardService service)
    {
        _service = service;
    }

    [HttpGet("summary")]
    [ProducesResponseType(typeof(ApiResponse<DashboardSummaryResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<DashboardSummaryResponse>>> GetSummary(
        CancellationToken cancellationToken)
    {
        var (isCoordinator, isAdmin) = this.GetEffectiveRoles();
        var summary = await _service.GetSummaryAsync(
            this.GetCurrentUserId(),
            isCoordinator,
            isAdmin,
            cancellationToken);
        return Ok(ApiResponse<DashboardSummaryResponse>.Ok("Dashboard summary loaded.", summary));
    }
}
