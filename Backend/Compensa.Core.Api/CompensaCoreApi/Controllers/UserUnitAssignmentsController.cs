using CompensaCoreApi.Contracts;
using CompensaCoreApi.Dtos.Assignments;
using CompensaCoreApi.Services.Assignments;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CompensaCoreApi.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/users/{userId}/unit-assignments")]
public sealed class UserUnitAssignmentsController : ControllerBase
{
    private readonly IUserUnitAssignmentService _service;

    public UserUnitAssignmentsController(IUserUnitAssignmentService service)
    {
        _service = service;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<UserAcademicAssignmentsResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<UserAcademicAssignmentsResponse>>> List(
        string userId,
        CancellationToken cancellationToken)
    {
        var assignments = await _service.ListByUserAsync(userId, cancellationToken);
        return Ok(ApiResponse<UserAcademicAssignmentsResponse>.Ok("User assignments loaded.", assignments));
    }

    [HttpPut]
    [ProducesResponseType(typeof(ApiResponse<UserAcademicAssignmentsResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<UserAcademicAssignmentsResponse>>> Save(
        string userId,
        [FromBody] SaveUserUnitAssignmentsRequest request,
        CancellationToken cancellationToken)
    {
        var assignments = await _service.SaveAsync(userId, request, cancellationToken);
        return Ok(ApiResponse<UserAcademicAssignmentsResponse>.Ok("User assignments saved.", assignments));
    }
}
