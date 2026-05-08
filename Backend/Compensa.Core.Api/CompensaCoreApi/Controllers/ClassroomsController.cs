using CompensaCoreApi.Contracts;
using CompensaCoreApi.Dtos.Classrooms;
using CompensaCoreApi.Services.Classrooms;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CompensaCoreApi.Controllers;

[ApiController]
[Authorize]
[Route("api/classrooms")]
public sealed class ClassroomsController : ControllerBase
{
    private readonly IClassroomService _service;

    public ClassroomsController(IClassroomService service)
    {
        _service = service;
    }

    [HttpGet]
    [Authorize(Roles = "Teacher,Coordinator,Admin")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyCollection<ClassroomResponse>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IReadOnlyCollection<ClassroomResponse>>>> List(
        [FromQuery] string? search,
        CancellationToken cancellationToken)
    {
        var classrooms = await _service.ListAsync(search, cancellationToken);
        return Ok(ApiResponse<IReadOnlyCollection<ClassroomResponse>>.Ok("Classrooms loaded.", classrooms));
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Teacher,Coordinator,Admin")]
    [ProducesResponseType(typeof(ApiResponse<ClassroomResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<ClassroomResponse>>> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var classroom = await _service.GetByIdAsync(id, cancellationToken);
        return Ok(ApiResponse<ClassroomResponse>.Ok("Classroom loaded.", classroom));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<ClassroomResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<ClassroomResponse>>> Create(
        [FromBody] CreateClassroomRequest request,
        CancellationToken cancellationToken)
    {
        var created = await _service.CreateAsync(request, cancellationToken);
        var response = ApiResponse<ClassroomResponse>.Ok("Classroom created.", created);

        return CreatedAtAction(nameof(GetById), new { id = created.Id }, response);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<ClassroomResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<ClassroomResponse>>> Update(
        Guid id,
        [FromBody] UpdateClassroomRequest request,
        CancellationToken cancellationToken)
    {
        var updated = await _service.UpdateAsync(id, request, cancellationToken);
        return Ok(ApiResponse<ClassroomResponse>.Ok("Classroom updated.", updated));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _service.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}
