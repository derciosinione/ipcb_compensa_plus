using CompensaIdentityApi.Infrastructure.MagicLinks;
using CompensaIdentityApi.Models;
using CompensaIdentityApi.Repositories.AuthTokens;
using Microsoft.Extensions.Options;
using System.Security.Cryptography;

namespace CompensaIdentityApi.Services;

public class MagicLinkService : IMagicLinkService
{
    private readonly IAuthTokenRepository _authTokenRepository;
    private readonly MagicLinkOptions _options;

    public MagicLinkService(IAuthTokenRepository authTokenRepository, IOptions<MagicLinkOptions> options)
    {
        _authTokenRepository = authTokenRepository;
        _options = options.Value;
    }

    public async Task<string> GenerateMagicLinkTokenAsync(
        ApplicationUser user,
        CancellationToken cancellationToken = default)
    {
        var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
        var tokenHash = HashToken(token);

        var authToken = new AuthToken
        {
            UserId = user.Id,
            TokenHash = tokenHash,
            ExpiresAt = DateTime.UtcNow.AddMinutes(_options.ExpirationMinutes)
        };

        await _authTokenRepository.AddAsync(authToken, cancellationToken);

        return token;
    }

    public async Task<ApplicationUser?> ValidateMagicLinkTokenAsync(
        string token,
        CancellationToken cancellationToken = default)
    {
        var tokenHash = HashToken(token);
        var now = DateTime.UtcNow;
        var authToken = await _authTokenRepository.FindValidTokenWithUserAsync(tokenHash, now, cancellationToken);

        if (authToken == null)
            return null;

        await _authTokenRepository.MarkAsUsedAsync(authToken, now, cancellationToken);

        return authToken.User;
    }

    private static string HashToken(string token)
    {
        var bytes = System.Text.Encoding.UTF8.GetBytes(token);
        var hash = SHA256.HashData(bytes);
        return Convert.ToBase64String(hash);
    }
}
