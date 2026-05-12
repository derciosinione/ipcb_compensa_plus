using CompensaCoreApi.Contracts;
using CompensaCoreApi.Dtos.Search;
using CompensaCoreApi.Services.Search;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CompensaCoreApi.Controllers;

[ApiController]
[Authorize(Roles = "Teacher,Coordinator,Admin")]
[Route("api/search")]
public sealed class SearchController : ControllerBase
{
    private readonly IGlobalSearchService _service;

    public SearchController(IGlobalSearchService service)
    {
        _service = service;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyCollection<GlobalSearchResultResponse>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IReadOnlyCollection<GlobalSearchResultResponse>>>> Search(
        [FromQuery] string query,
        CancellationToken cancellationToken)
    {
        var results = await _service.SearchAsync(query ?? string.Empty, cancellationToken);
        return Ok(ApiResponse<IReadOnlyCollection<GlobalSearchResultResponse>>.Ok("Search results loaded.", results));
    }
}
