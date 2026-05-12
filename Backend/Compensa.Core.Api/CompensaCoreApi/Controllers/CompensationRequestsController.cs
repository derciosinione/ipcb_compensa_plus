using CompensaCoreApi.Contracts;
using CompensaCoreApi.Domain.CompensationRequests;
using CompensaCoreApi.Dtos.CompensationRequests;
using CompensaCoreApi.Services.CompensationRequests;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CompensaCoreApi.Controllers;

[ApiController]
[Authorize]
[Route("api/compensation-requests")]
public sealed class CompensationRequestsController : ControllerBase
{
    private readonly ICompensationRequestService _service;

    public CompensationRequestsController(ICompensationRequestService service)
    {
        _service = service;
    }

    [HttpGet]
    [Authorize(Roles = "Teacher,Coordinator,Admin")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyCollection<CompensationRequestResponse>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IReadOnlyCollection<CompensationRequestResponse>>>> List(
        [FromQuery] CompensationRequestStatus? status,
        [FromQuery] string? teacherUserId,
        CancellationToken cancellationToken)
    {
        var requests = await _service.ListAsync(
            status,
            teacherUserId,
            GetCurrentUserId(),
            User.IsInRole("Coordinator"),
            User.IsInRole("Admin"),
            cancellationToken);
        return Ok(ApiResponse<IReadOnlyCollection<CompensationRequestResponse>>.Ok("Compensation requests loaded.", requests));
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Teacher,Coordinator,Admin")]
    [ProducesResponseType(typeof(ApiResponse<CompensationRequestResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<CompensationRequestResponse>>> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var request = await _service.GetByIdAsync(
            id,
            GetCurrentUserId(),
            User.IsInRole("Coordinator"),
            User.IsInRole("Admin"),
            cancellationToken);
        return Ok(ApiResponse<CompensationRequestResponse>.Ok("Compensation request loaded.", request));
    }

    [HttpPost]
    [Authorize(Roles = "Teacher,Coordinator,Admin")]
    [ProducesResponseType(typeof(ApiResponse<CompensationRequestResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<CompensationRequestResponse>>> Create(
        [FromBody] CreateCompensationRequestRequest request,
        CancellationToken cancellationToken)
    {
        var actorUserId = GetCurrentUserId();
        var created = await _service.CreateAsync(
            request,
            actorUserId,
            User.IsInRole("Coordinator"),
            User.IsInRole("Admin"),
            cancellationToken);
        var response = ApiResponse<CompensationRequestResponse>.Ok("Compensation request created.", created);

        return CreatedAtAction(nameof(GetById), new { id = created.Id }, response);
    }

    [HttpPatch("{id:guid}/status")]
    [Authorize(Roles = "Coordinator,Admin")]
    [ProducesResponseType(typeof(ApiResponse<CompensationRequestResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<CompensationRequestResponse>>> UpdateStatus(
        Guid id,
        [FromBody] UpdateCompensationRequestStatusRequest request,
        CancellationToken cancellationToken)
    {
        var updated = await _service.UpdateStatusAsync(
            id,
            request,
            GetCurrentUserId(),
            User.IsInRole("Coordinator"),
            User.IsInRole("Admin"),
            cancellationToken);
        return Ok(ApiResponse<CompensationRequestResponse>.Ok("Compensation request status updated.", updated));
    }

    private string GetCurrentUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub")
            ?? throw new InvalidOperationException("Authenticated user id was not found.");
    }
}
