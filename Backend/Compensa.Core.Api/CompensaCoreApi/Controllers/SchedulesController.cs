using CompensaCoreApi.Contracts;
using CompensaCoreApi.Dtos.Schedules;
using CompensaCoreApi.Services.Schedules;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace CompensaCoreApi.Controllers;

[ApiController]
[Route("api/schedules")]
public sealed class SchedulesController : ControllerBase
{
    private readonly IScheduleAvailabilityService _availabilityService;
    private readonly ITimetableImportService _importService;

    public SchedulesController(
        IScheduleAvailabilityService availabilityService,
        ITimetableImportService importService)
    {
        _availabilityService = availabilityService;
        _importService = importService;
    }

    [HttpGet("availability")]
    [Authorize(Roles = "Teacher,Coordinator,Admin")]
    [ProducesResponseType(typeof(ApiResponse<ScheduleAvailabilityResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<ScheduleAvailabilityResponse>>> CheckAvailability(
        [FromQuery] ScheduleAvailabilityQuery query,
        CancellationToken cancellationToken)
    {
        var availability = await _availabilityService.CheckAsync(query, cancellationToken);
        return Ok(ApiResponse<ScheduleAvailabilityResponse>.Ok("Schedule availability checked.", availability));
    }

    [HttpPost("import/preview")]
    [Authorize(Roles = "Coordinator,Admin")]
    [ProducesResponseType(typeof(ApiResponse<TimetableImportPreviewResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<TimetableImportPreviewResponse>>> PreviewImport(
        [FromForm] IFormFileCollection files,
        [FromForm] Guid? academicYearId,
        CancellationToken cancellationToken)
    {
        if (files == null || files.Count == 0)
        {
            return BadRequest(ApiResponse<object>.Fail("No files uploaded."));
        }

        var parsedFiles = new List<(string Filename, byte[] Content)>();
        foreach (var file in files)
        {
            using var ms = new MemoryStream();
            await file.CopyToAsync(ms, cancellationToken);
            parsedFiles.Add((file.FileName, ms.ToArray()));
        }

        var preview = await _importService.ProcessTimetablesAsync(parsedFiles, academicYearId, cancellationToken);
        return Ok(ApiResponse<TimetableImportPreviewResponse>.Ok("Timetable files processed successfully.", preview));
    }

    [HttpPost("import/confirm")]
    [Authorize(Roles = "Coordinator,Admin")]
    [ProducesResponseType(typeof(ApiResponse<int>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<int>>> ConfirmImport(
        [FromBody] TimetableImportConfirmRequest request,
        CancellationToken cancellationToken)
    {
        if (request == null)
        {
            return BadRequest(ApiResponse<object>.Fail("Invalid request payload."));
        }

        int count = await _importService.ConfirmImportAsync(request, cancellationToken);
        return Ok(ApiResponse<int>.Ok($"{count} class schedules imported successfully.", count));
    }
}
