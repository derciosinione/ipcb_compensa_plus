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

    [HttpPost("{courseId:guid}/units")]
    [Authorize(Roles = "Admin,Coordinator")]
    [ProducesResponseType(typeof(ApiResponse<CurricularUnitResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<CurricularUnitResponse>>> CreateUnit(
        Guid courseId,
        [FromBody] UpsertCurricularUnitRequest request,
        CancellationToken cancellationToken)
    {
        var created = await _service.CreateUnitAsync(courseId, request, cancellationToken);
        return CreatedAtAction(
            nameof(GetDetails),
            new { id = courseId },
            ApiResponse<CurricularUnitResponse>.Ok("Curricular unit created.", created));
    }

    [HttpPut("{courseId:guid}/units/{unitId:guid}")]
    [Authorize(Roles = "Admin,Coordinator")]
    [ProducesResponseType(typeof(ApiResponse<CurricularUnitResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<CurricularUnitResponse>>> UpdateUnit(
        Guid courseId,
        Guid unitId,
        [FromBody] UpsertCurricularUnitRequest request,
        CancellationToken cancellationToken)
    {
        var updated = await _service.UpdateUnitAsync(courseId, unitId, request, cancellationToken);
        return Ok(ApiResponse<CurricularUnitResponse>.Ok("Curricular unit updated.", updated));
    }

    [HttpDelete("{courseId:guid}/units/{unitId:guid}")]
    [Authorize(Roles = "Admin,Coordinator")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteUnit(
        Guid courseId,
        Guid unitId,
        CancellationToken cancellationToken)
    {
        await _service.DeleteUnitAsync(courseId, unitId, cancellationToken);
        return NoContent();
    }

    [HttpPost("{courseId:guid}/units/{unitId:guid}/components")]
    [Authorize(Roles = "Admin,Coordinator")]
    [ProducesResponseType(typeof(ApiResponse<CurricularUnitComponentResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<CurricularUnitComponentResponse>>> CreateComponent(
        Guid courseId,
        Guid unitId,
        [FromBody] UpsertCurricularUnitComponentRequest request,
        CancellationToken cancellationToken)
    {
        var created = await _service.CreateComponentAsync(courseId, unitId, request, cancellationToken);
        return CreatedAtAction(
            nameof(GetDetails),
            new { id = courseId },
            ApiResponse<CurricularUnitComponentResponse>.Ok("Curricular unit component created.", created));
    }

    [HttpPut("{courseId:guid}/units/{unitId:guid}/components/{componentId:guid}")]
    [Authorize(Roles = "Admin,Coordinator")]
    [ProducesResponseType(typeof(ApiResponse<CurricularUnitComponentResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<CurricularUnitComponentResponse>>> UpdateComponent(
        Guid courseId,
        Guid unitId,
        Guid componentId,
        [FromBody] UpsertCurricularUnitComponentRequest request,
        CancellationToken cancellationToken)
    {
        var updated = await _service.UpdateComponentAsync(courseId, unitId, componentId, request, cancellationToken);
        return Ok(ApiResponse<CurricularUnitComponentResponse>.Ok("Curricular unit component updated.", updated));
    }

    [HttpDelete("{courseId:guid}/units/{unitId:guid}/components/{componentId:guid}")]
    [Authorize(Roles = "Admin,Coordinator")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteComponent(
        Guid courseId,
        Guid unitId,
        Guid componentId,
        CancellationToken cancellationToken)
    {
        await _service.DeleteComponentAsync(courseId, unitId, componentId, cancellationToken);
        return NoContent();
    }

    [HttpPost("{courseId:guid}/classes")]
    [Authorize(Roles = "Admin,Coordinator")]
    [ProducesResponseType(typeof(ApiResponse<ClassGroupResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<ClassGroupResponse>>> CreateClassGroup(
        Guid courseId,
        [FromBody] UpsertClassGroupRequest request,
        CancellationToken cancellationToken)
    {
        var created = await _service.CreateClassGroupAsync(courseId, request, cancellationToken);
        return CreatedAtAction(
            nameof(GetDetails),
            new { id = courseId },
            ApiResponse<ClassGroupResponse>.Ok("Class group created.", created));
    }

    [HttpPut("{courseId:guid}/classes/{classGroupId:guid}")]
    [Authorize(Roles = "Admin,Coordinator")]
    [ProducesResponseType(typeof(ApiResponse<ClassGroupResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<ClassGroupResponse>>> UpdateClassGroup(
        Guid courseId,
        Guid classGroupId,
        [FromBody] UpsertClassGroupRequest request,
        CancellationToken cancellationToken)
    {
        var updated = await _service.UpdateClassGroupAsync(courseId, classGroupId, request, cancellationToken);
        return Ok(ApiResponse<ClassGroupResponse>.Ok("Class group updated.", updated));
    }

    [HttpDelete("{courseId:guid}/classes/{classGroupId:guid}")]
    [Authorize(Roles = "Admin,Coordinator")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteClassGroup(
        Guid courseId,
        Guid classGroupId,
        CancellationToken cancellationToken)
    {
        await _service.DeleteClassGroupAsync(courseId, classGroupId, cancellationToken);
        return NoContent();
    }

    [HttpPost("{courseId:guid}/classes/{classGroupId:guid}/schedules")]
    [Authorize(Roles = "Admin,Coordinator")]
    [ProducesResponseType(typeof(ApiResponse<ClassScheduleResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<ClassScheduleResponse>>> CreateSchedule(
        Guid courseId,
        Guid classGroupId,
        [FromBody] UpsertClassScheduleRequest request,
        CancellationToken cancellationToken)
    {
        var created = await _service.CreateScheduleAsync(courseId, classGroupId, request, cancellationToken);
        return CreatedAtAction(
            nameof(GetDetails),
            new { id = courseId },
            ApiResponse<ClassScheduleResponse>.Ok("Class schedule created.", created));
    }

    [HttpPut("{courseId:guid}/classes/{classGroupId:guid}/schedules/{scheduleId:guid}")]
    [Authorize(Roles = "Admin,Coordinator")]
    [ProducesResponseType(typeof(ApiResponse<ClassScheduleResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<ClassScheduleResponse>>> UpdateSchedule(
        Guid courseId,
        Guid classGroupId,
        Guid scheduleId,
        [FromBody] UpsertClassScheduleRequest request,
        CancellationToken cancellationToken)
    {
        var updated = await _service.UpdateScheduleAsync(courseId, classGroupId, scheduleId, request, cancellationToken);
        return Ok(ApiResponse<ClassScheduleResponse>.Ok("Class schedule updated.", updated));
    }

    [HttpDelete("{courseId:guid}/classes/{classGroupId:guid}/schedules/{scheduleId:guid}")]
    [Authorize(Roles = "Admin,Coordinator")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteSchedule(
        Guid courseId,
        Guid classGroupId,
        Guid scheduleId,
        CancellationToken cancellationToken)
    {
        await _service.DeleteScheduleAsync(courseId, classGroupId, scheduleId, cancellationToken);
        return NoContent();
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
