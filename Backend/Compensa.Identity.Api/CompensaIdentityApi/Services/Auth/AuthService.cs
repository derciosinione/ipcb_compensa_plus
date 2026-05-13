using CompensaIdentityApi.Contracts.Auth;
using CompensaIdentityApi.Data;
using CompensaIdentityApi.DTOs;
using CompensaIdentityApi.Infrastructure.Auth;
using CompensaIdentityApi.Infrastructure.Email;
using CompensaIdentityApi.Infrastructure.MagicLinks;
using CompensaIdentityApi.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace CompensaIdentityApi.Services.Auth;

public sealed class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IMagicLinkService _magicLinkService;
    private readonly IMagicLinkUrlBuilder _magicLinkUrlBuilder;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IEmailSender _emailSender;
    private readonly IWebHostEnvironment _environment;
    private readonly ApplicationDbContext _dbContext;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        IMagicLinkService magicLinkService,
        IMagicLinkUrlBuilder magicLinkUrlBuilder,
        IJwtTokenService jwtTokenService,
        IEmailSender emailSender,
        IWebHostEnvironment environment,
        ApplicationDbContext dbContext,
        ILogger<AuthService> logger)
    {
        _userManager = userManager;
        _magicLinkService = magicLinkService;
        _magicLinkUrlBuilder = magicLinkUrlBuilder;
        _jwtTokenService = jwtTokenService;
        _emailSender = emailSender;
        _environment = environment;
        _dbContext = dbContext;
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

        return await GenerateAuthResponseAsync(user, cancellationToken);
    }

    public async Task<VerifyMagicLinkResponse?> RefreshTokenAsync(
        string refreshToken,
        CancellationToken cancellationToken = default)
    {
        var storedToken = await _dbContext.RefreshTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.Token == refreshToken, cancellationToken);

        if (storedToken == null)
            return null;

        var isActuallyExpired = storedToken.IsExpired;
        var wasRevokedLongAgo = storedToken.RevokedAt != null && storedToken.RevokedAt < DateTime.UtcNow.AddSeconds(-60);

        if (isActuallyExpired || wasRevokedLongAgo)
            return null;

        // Revoke current token
        storedToken.RevokedAt = DateTime.UtcNow;
        _dbContext.RefreshTokens.Update(storedToken);

        return await GenerateAuthResponseAsync(storedToken.User, cancellationToken);
    }

    private async Task<VerifyMagicLinkResponse> GenerateAuthResponseAsync(
        ApplicationUser user,
        CancellationToken cancellationToken)
    {
        var roles = await _userManager.GetRolesAsync(user);
        var roleArray = roles.ToArray();
        var tokens = _jwtTokenService.CreateAccessToken(user, roleArray);

        // Save refresh token
        var refreshTokenEntity = new RefreshToken
        {
            Token = tokens.RefreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(7), // Refresh token expires in 7 days
            UserId = user.Id
        };

        _dbContext.RefreshTokens.Add(refreshTokenEntity);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new VerifyMagicLinkResponse(
            user.Id,
            user.Email,
            user.FullName,
            roleArray,
            tokens.AccessToken,
            tokens.ExpiresAt,
            tokens.RefreshToken,
            refreshTokenEntity.ExpiresAt);
    }
}
