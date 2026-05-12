using CompensaIdentityApi.Contracts;
using CompensaIdentityApi.Contracts.Users;
using CompensaIdentityApi.Services.Users;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CompensaIdentityApi.Controllers;

[ApiController]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
[Route("api/users")]
public sealed class UsersController : ControllerBase
{
    private readonly IUserService _service;

    public UsersController(IUserService service)
    {
        _service = service;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyCollection<UserResponse>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IReadOnlyCollection<UserResponse>>>> List(
        [FromQuery] string? search,
        CancellationToken cancellationToken)
    {
        var users = await _service.ListAsync(search, cancellationToken);
        return Ok(ApiResponse<IReadOnlyCollection<UserResponse>>.Ok("Users loaded.", users));
    }

    [HttpGet("roles")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyCollection<RoleResponse>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IReadOnlyCollection<RoleResponse>>>> ListRoles(
        CancellationToken cancellationToken)
    {
        var roles = await _service.ListRolesAsync(cancellationToken);
        return Ok(ApiResponse<IReadOnlyCollection<RoleResponse>>.Ok("Roles loaded.", roles));
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<UserResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<UserResponse>>> Create(
        [FromBody] CreateUserRequest request,
        CancellationToken cancellationToken)
    {
        var created = await _service.CreateAsync(request, cancellationToken);
        var response = ApiResponse<UserResponse>.Ok("User created.", created);

        return CreatedAtAction(nameof(List), new { id = created.Id }, response);
    }

    [HttpPut("{id}/roles")]
    [ProducesResponseType(typeof(ApiResponse<UserResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<UserResponse>>> UpdateRoles(
        string id,
        [FromBody] UpdateUserRolesRequest request,
        CancellationToken cancellationToken)
    {
        var updated = await _service.UpdateRolesAsync(id, request, cancellationToken);
        return Ok(ApiResponse<UserResponse>.Ok("User roles updated.", updated));
    }
}
