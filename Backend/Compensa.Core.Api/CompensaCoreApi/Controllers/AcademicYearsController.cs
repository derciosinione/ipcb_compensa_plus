using CompensaCoreApi.Contracts;
using CompensaCoreApi.Dtos.AcademicYears;
using CompensaCoreApi.Services.AcademicYears;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CompensaCoreApi.Controllers;

[ApiController]
[Authorize]
[Route("api/academic-years")]
public sealed class AcademicYearsController : ControllerBase
{
    private readonly IAcademicYearService _service;

    public AcademicYearsController(IAcademicYearService service)
    {
        _service = service;
    }

    [HttpGet]
    [Authorize(Roles = "Teacher,Coordinator,Admin")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyCollection<AcademicYearResponse>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IReadOnlyCollection<AcademicYearResponse>>>> List(
        CancellationToken cancellationToken)
    {
        var years = await _service.ListAsync(cancellationToken);
        return Ok(ApiResponse<IReadOnlyCollection<AcademicYearResponse>>.Ok("Academic years loaded.", years));
    }

    [HttpGet("active")]
    [Authorize(Roles = "Teacher,Coordinator,Admin")]
    [ProducesResponseType(typeof(ApiResponse<AcademicYearResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<AcademicYearResponse>>> GetActive(CancellationToken cancellationToken)
    {
        var year = await _service.GetActiveAsync(cancellationToken);
        return Ok(ApiResponse<AcademicYearResponse>.Ok("Active academic year loaded.", year));
    }
}
