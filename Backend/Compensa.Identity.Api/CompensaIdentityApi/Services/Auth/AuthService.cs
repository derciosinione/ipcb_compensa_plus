using CompensaIdentityApi.Contracts.Auth;
using CompensaIdentityApi.DTOs;
using CompensaIdentityApi.Infrastructure.Auth;
using CompensaIdentityApi.Infrastructure.Email;
using CompensaIdentityApi.Infrastructure.MagicLinks;
using CompensaIdentityApi.Models;
using Microsoft.AspNetCore.Identity;

namespace CompensaIdentityApi.Services.Auth;

public sealed class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IMagicLinkService _magicLinkService;
    private readonly IMagicLinkUrlBuilder _magicLinkUrlBuilder;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IEmailSender _emailSender;
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        IMagicLinkService magicLinkService,
        IMagicLinkUrlBuilder magicLinkUrlBuilder,
        IJwtTokenService jwtTokenService,
        IEmailSender emailSender,
        IWebHostEnvironment environment,
        ILogger<AuthService> logger)
    {
        _userManager = userManager;
        _magicLinkService = magicLinkService;
        _magicLinkUrlBuilder = magicLinkUrlBuilder;
        _jwtTokenService = jwtTokenService;
        _emailSender = emailSender;
        _environment = environment;
        _logger = logger;
    }

    public async Task<LoginResponse> RequestMagicLinkAsync(
        LoginRequest request,
        CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);

        if (user == null)
        {
            _logger.LogInformation("Magic link requested for unknown email {Email}", request.Email);
            return new LoginResponse(request.Email, MagicLinkSent: true);
        }

        var token = await _magicLinkService.GenerateMagicLinkTokenAsync(user, cancellationToken);
        var magicLink = _magicLinkUrlBuilder.BuildVerifyUrl(token);

        await _emailSender.SendMagicLinkAsync(user.Email!, magicLink, cancellationToken);

        return new LoginResponse(
            user.Email!,
            MagicLinkSent: true,
            DevMagicLink: _environment.IsDevelopment() ? magicLink : null);
    }

    public async Task<VerifyMagicLinkResponse?> VerifyMagicLinkAsync(
        string token,
        CancellationToken cancellationToken = default)
    {
        var user = await _magicLinkService.ValidateMagicLinkTokenAsync(token, cancellationToken);

        if (user == null)
            return null;

        var roles = await _userManager.GetRolesAsync(user);
        var roleArray = roles.ToArray();
        var accessToken = _jwtTokenService.CreateAccessToken(user, roleArray);

        return new VerifyMagicLinkResponse(
            user.Id,
            user.Email,
            user.FullName,
            roleArray,
            accessToken.AccessToken,
            accessToken.ExpiresAt);
    }
}
