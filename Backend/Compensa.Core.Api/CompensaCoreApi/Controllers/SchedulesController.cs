using CompensaCoreApi.Contracts;
using CompensaCoreApi.Dtos.Schedules;
using CompensaCoreApi.Services.Schedules;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CompensaCoreApi.Controllers;

[ApiController]
[Authorize(Roles = "Teacher,Coordinator,Admin")]
[Route("api/schedules")]
public sealed class SchedulesController : ControllerBase
{
    private readonly IScheduleAvailabilityService _availabilityService;

    public SchedulesController(IScheduleAvailabilityService availabilityService)
    {
        _availabilityService = availabilityService;
    }

    [HttpGet("availability")]
    [ProducesResponseType(typeof(ApiResponse<ScheduleAvailabilityResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<ScheduleAvailabilityResponse>>> CheckAvailability(
        [FromQuery] ScheduleAvailabilityQuery query,
        CancellationToken cancellationToken)
    {
        var availability = await _availabilityService.CheckAsync(query, cancellationToken);
        return Ok(ApiResponse<ScheduleAvailabilityResponse>.Ok("Schedule availability checked.", availability));
    }
}
