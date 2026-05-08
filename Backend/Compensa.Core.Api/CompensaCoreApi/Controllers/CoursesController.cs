using CompensaCoreApi.Contracts;
using CompensaCoreApi.Dtos.Courses;
using CompensaCoreApi.Services.Courses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CompensaCoreApi.Controllers;

[ApiController]
[Authorize]
[Route("api/courses")]
public sealed class CoursesController : ControllerBase
{
    private readonly ICourseService _service;

    public CoursesController(ICourseService service)
    {
        _service = service;
    }

    [HttpGet]
    [Authorize(Roles = "Teacher,Coordinator,Admin")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyCollection<CourseResponse>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IReadOnlyCollection<CourseResponse>>>> List(
        [FromQuery] string? search,
        CancellationToken cancellationToken)
    {
        var courses = await _service.ListAsync(search, cancellationToken);
        return Ok(ApiResponse<IReadOnlyCollection<CourseResponse>>.Ok("Courses loaded.", courses));
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Teacher,Coordinator,Admin")]
    [ProducesResponseType(typeof(ApiResponse<CourseResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<CourseResponse>>> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var course = await _service.GetByIdAsync(id, cancellationToken);
        return Ok(ApiResponse<CourseResponse>.Ok("Course loaded.", course));
    }

    [HttpGet("{id:guid}/details")]
    [Authorize(Roles = "Teacher,Coordinator,Admin")]
    [ProducesResponseType(typeof(ApiResponse<CourseDetailsResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<CourseDetailsResponse>>> GetDetails(
        Guid id,
        CancellationToken cancellationToken)
    {
        var details = await _service.GetDetailsAsync(id, cancellationToken);
        return Ok(ApiResponse<CourseDetailsResponse>.Ok("Course details loaded.", details));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<CourseResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<CourseResponse>>> Create(
        [FromBody] CreateCourseRequest request,
        CancellationToken cancellationToken)
    {
        var created = await _service.CreateAsync(request, cancellationToken);
        var response = ApiResponse<CourseResponse>.Ok("Course created.", created);

        return CreatedAtAction(nameof(GetById), new { id = created.Id }, response);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<CourseResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<CourseResponse>>> Update(
        Guid id,
        [FromBody] UpdateCourseRequest request,
        CancellationToken cancellationToken)
    {
        var updated = await _service.UpdateAsync(id, request, cancellationToken);
        return Ok(ApiResponse<CourseResponse>.Ok("Course updated.", updated));
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
