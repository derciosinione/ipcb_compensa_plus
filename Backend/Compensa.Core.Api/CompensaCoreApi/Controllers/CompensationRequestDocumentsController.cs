using CompensaCoreApi.Contracts;
using CompensaCoreApi.Dtos.CompensationRequests;
using CompensaCoreApi.Services.CompensationRequests;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CompensaCoreApi.Controllers;

[ApiController]
[Authorize]
[Route("api/compensation-requests/{requestId:guid}/documents")]
public sealed class CompensationRequestDocumentsController : ControllerBase
{
    private readonly ICompensationRequestService _service;

    public CompensationRequestDocumentsController(ICompensationRequestService service)
    {
        _service = service;
    }

    [HttpPost]
    [Authorize(Roles = "Teacher,Coordinator,Admin")]
    [ProducesResponseType(typeof(ApiResponse<CompensationRequestDocumentResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<CompensationRequestDocumentResponse>>> Upload(
        Guid requestId,
        IFormFile file,
        CancellationToken cancellationToken)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(ApiResponse<object>.Fail("No file was uploaded."));
        }

        var response = await _service.UploadDocumentAsync(
            requestId,
            file.OpenReadStream(),
            file.FileName,
            file.ContentType,
            file.Length,
            GetCurrentUserId(),
            User.IsInRole("Coordinator"),
            User.IsInRole("Admin"),
            cancellationToken);

        return Created("", ApiResponse<CompensationRequestDocumentResponse>.Ok("Document uploaded successfully.", response));
    }

    [HttpGet]
    [Authorize(Roles = "Teacher,Coordinator,Admin")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyCollection<CompensationRequestDocumentResponse>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IReadOnlyCollection<CompensationRequestDocumentResponse>>>> List(
        Guid requestId, 
        CancellationToken cancellationToken)
    {
        var response = await _service.ListDocumentsAsync(
            requestId,
            GetCurrentUserId(),
            User.IsInRole("Coordinator"),
            User.IsInRole("Admin"),
            cancellationToken);

        return Ok(ApiResponse<IReadOnlyCollection<CompensationRequestDocumentResponse>>.Ok("Documents loaded.", response));
    }

    [HttpGet("{documentId:guid}")]
    [Authorize(Roles = "Teacher,Coordinator,Admin")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Download(Guid requestId, Guid documentId, CancellationToken cancellationToken)
    {
        var (stream, fileName, contentType) = await _service.GetDocumentFileAsync(
            requestId,
            documentId,
            GetCurrentUserId(),
            User.IsInRole("Coordinator"),
            User.IsInRole("Admin"),
            cancellationToken);

        return File(stream, contentType, fileName);
    }

    [HttpDelete("{documentId:guid}")]
    [Authorize(Roles = "Teacher,Coordinator,Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid requestId, Guid documentId, CancellationToken cancellationToken)
    {
        await _service.DeleteDocumentAsync(
            requestId,
            documentId,
            GetCurrentUserId(),
            User.IsInRole("Coordinator"),
            User.IsInRole("Admin"),
            cancellationToken);

        return NoContent();
    }

    private string GetCurrentUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub")
            ?? throw new InvalidOperationException("Authenticated user id was not found.");
    }
}
