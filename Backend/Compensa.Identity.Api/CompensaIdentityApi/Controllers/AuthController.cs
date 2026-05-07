using CompensaIdentityApi.Contracts;
using CompensaIdentityApi.Contracts.Auth;
using CompensaIdentityApi.DTOs;
using CompensaIdentityApi.Services.Auth;
using Microsoft.AspNetCore.Mvc;

namespace CompensaIdentityApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    [ProducesResponseType(typeof(ApiResponse<LoginResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> Login(
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken)
    {
        var response = await _authService.RequestMagicLinkAsync(request, cancellationToken);

        return Ok(ApiResponse<LoginResponse>.Ok(
            "If the email is registered, a magic link has been sent.",
            response));
    }

    [HttpGet("verify")]
    [ProducesResponseType(typeof(ApiResponse<VerifyMagicLinkResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<VerifyMagicLinkResponse>>> Verify(
        [FromQuery] string token,
        CancellationToken cancellationToken)
    {
        var response = await _authService.VerifyMagicLinkAsync(token, cancellationToken);
        
        if (response == null)
        {
            return BadRequest(ApiResponse<object>.Fail("Invalid or expired token."));
        }

        return Ok(ApiResponse<VerifyMagicLinkResponse>.Ok("Magic link verified.", response));
    }
}
