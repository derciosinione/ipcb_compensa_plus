using CompensaCoreApi.Contracts;
using CompensaCoreApi.Domain.CompensationRequests;
using CompensaCoreApi.Dtos.CompensationRequests;
using CompensaCoreApi.Services.CompensationRequests;
using CompensaCoreApi.Extensions;
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
        var (isCoordinator, isAdmin) = this.GetEffectiveRoles();
        var requests = await _service.ListAsync(
            status,
            teacherUserId,
            this.GetCurrentUserId(),
            isCoordinator,
            isAdmin,
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
        var (isCoordinator, isAdmin) = this.GetEffectiveRoles();
        var request = await _service.GetByIdAsync(
            id,
            this.GetCurrentUserId(),
            isCoordinator,
            isAdmin,
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
        var actorUserId = this.GetCurrentUserId();
        var (isCoordinator, isAdmin) = this.GetEffectiveRoles();
        var created = await _service.CreateAsync(
            request,
            actorUserId,
            isCoordinator,
            isAdmin,
            cancellationToken);
        var response = ApiResponse<CompensationRequestResponse>.Ok("Compensation request created.", created);

        return CreatedAtAction(nameof(GetById), new { id = created.Id }, response);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Teacher,Coordinator,Admin")]
    [ProducesResponseType(typeof(ApiResponse<CompensationRequestResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<CompensationRequestResponse>>> Update(
        Guid id,
        [FromBody] UpdateCompensationRequestRequest request,
        CancellationToken cancellationToken)
    {
        var (isCoordinator, isAdmin) = this.GetEffectiveRoles();
        var updated = await _service.UpdateAsync(
            id,
            request,
            this.GetCurrentUserId(),
            isCoordinator,
            isAdmin,
            cancellationToken);
        return Ok(ApiResponse<CompensationRequestResponse>.Ok("Compensation request updated.", updated));
    }

    [HttpPatch("{id:guid}/status")]
    [Authorize(Roles = "Teacher,Coordinator,Admin")]
    [ProducesResponseType(typeof(ApiResponse<CompensationRequestResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<CompensationRequestResponse>>> UpdateStatus(
        Guid id,
        [FromBody] UpdateCompensationRequestStatusRequest request,
        CancellationToken cancellationToken)
    {
        var (isCoordinator, isAdmin) = this.GetEffectiveRoles();
        var updated = await _service.UpdateStatusAsync(
            id,
            request,
            this.GetCurrentUserId(),
            isCoordinator,
            isAdmin,
            cancellationToken);
        return Ok(ApiResponse<CompensationRequestResponse>.Ok("Compensation request status updated.", updated));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Coordinator,Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> Delete(
        Guid id,
        CancellationToken cancellationToken)
    {
        var (isCoordinator, isAdmin) = this.GetEffectiveRoles();
        await _service.DeleteAsync(
            id,
            this.GetCurrentUserId(),
            isCoordinator,
            isAdmin,
            cancellationToken);

        return NoContent();
    }

    [HttpPost("{id:guid}/documents")]
    [Authorize(Roles = "Teacher,Coordinator,Admin")]
    [ProducesResponseType(typeof(ApiResponse<CompensationRequestDocumentResponse>), StatusCodes.Status201Created)]
    public async Task<ActionResult<ApiResponse<CompensationRequestDocumentResponse>>> UploadDocument(
        Guid id,
        IFormFile file,
        CancellationToken cancellationToken)
    {
        if (file == null || file.Length == 0)
            return BadRequest(ApiResponse<object>.Fail("No file uploaded."));

        using var stream = file.OpenReadStream();
        var (isCoordinator, isAdmin) = this.GetEffectiveRoles();
        
        string role = "teacher";
        if (isAdmin) role = "admin";
        else if (isCoordinator) role = "coordinator";

        var uploaded = await _service.UploadDocumentAsync(
            id,
            stream,
            file.FileName,
            file.ContentType,
            file.Length,
            this.GetCurrentUserId(),
            this.GetCurrentUserName(),
            role,
            isCoordinator,
            isAdmin,
            cancellationToken);

        return CreatedAtAction(nameof(GetDocumentFile), new { id, documentId = uploaded.Id }, ApiResponse<CompensationRequestDocumentResponse>.Ok("Document uploaded.", uploaded));
    }

    [HttpGet("{id:guid}/documents")]
    [Authorize(Roles = "Teacher,Coordinator,Admin")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyCollection<CompensationRequestDocumentResponse>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IReadOnlyCollection<CompensationRequestDocumentResponse>>>> ListDocuments(
        Guid id,
        CancellationToken cancellationToken)
    {
        var (isCoordinator, isAdmin) = this.GetEffectiveRoles();
        var documents = await _service.ListDocumentsAsync(
            id,
            this.GetCurrentUserId(),
            isCoordinator,
            isAdmin,
            cancellationToken);
        return Ok(ApiResponse<IReadOnlyCollection<CompensationRequestDocumentResponse>>.Ok("Documents loaded.", documents));
    }

    [HttpGet("{id:guid}/documents/{documentId:guid}")]
    [Authorize(Roles = "Teacher,Coordinator,Admin")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDocumentFile(
        Guid id,
        Guid documentId,
        CancellationToken cancellationToken)
    {
        var (isCoordinator, isAdmin) = this.GetEffectiveRoles();
        var (stream, fileName, contentType) = await _service.GetDocumentFileAsync(
            id,
            documentId,
            this.GetCurrentUserId(),
            isCoordinator,
            isAdmin,
            cancellationToken);

        return File(stream, contentType, fileName);
    }

    [HttpDelete("{id:guid}/documents/{documentId:guid}")]
    [Authorize(Roles = "Teacher,Coordinator,Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<ActionResult> DeleteDocument(
        Guid id,
        Guid documentId,
        CancellationToken cancellationToken)
    {
        var (isCoordinator, isAdmin) = this.GetEffectiveRoles();
        await _service.DeleteDocumentAsync(
            id,
            documentId,
            this.GetCurrentUserId(),
            isCoordinator,
            isAdmin,
            cancellationToken);

        return NoContent();
    }

    [HttpPost("{id:guid}/comments")]
    [Authorize(Roles = "Teacher,Coordinator,Admin")]
    [ProducesResponseType(typeof(ApiResponse<CompensationRequestCommentResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<CompensationRequestCommentResponse>>> AddComment(
        Guid id,
        [FromBody] AddCommentRequest request,
        CancellationToken cancellationToken)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Text))
            return BadRequest(ApiResponse<object>.Fail("Comment text cannot be empty."));

        var (isCoordinator, isAdmin) = this.GetEffectiveRoles();
        
        string role = "teacher";
        if (isAdmin) role = "admin";
        else if (isCoordinator) role = "coordinator";

        var comment = await _service.AddCommentAsync(
            id,
            request.Text,
            this.GetCurrentUserId(),
            this.GetCurrentUserName(),
            role,
            cancellationToken);

        return Created("", ApiResponse<CompensationRequestCommentResponse>.Ok("Comment added successfully.", comment));
    }
}
