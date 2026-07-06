using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CompensaIdentityApi.Infrastructure.Auth;
using CompensaIdentityApi.Models;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace CompensaIdentityApi.Tests;

[Trait("Category", "Unit")]
public sealed class JwtTokenServiceTests
{
    private const string SigningKey = "unit-test-signing-key-with-more-than-32-chars";

    [Fact]
    public void CreateAccessToken_IncludesExpectedUserAndRoleClaims()
    {
        var service = CreateService();
        var user = new ApplicationUser
        {
            Id = "user-123",
            Email = "teacher@compensa.test",
            FullName = "Test Teacher"
        };

        var tokenResult = service.CreateAccessToken(user, ["Teacher", "Coordinator"]);

        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(tokenResult.AccessToken);
        var principal = ValidateToken(tokenResult.AccessToken);

        Assert.Equal("user-123", jwt.Claims.First(claim => claim.Type == JwtRegisteredClaimNames.Sub).Value);
        Assert.Equal("teacher@compensa.test", jwt.Claims.First(claim => claim.Type == JwtRegisteredClaimNames.Email).Value);
        Assert.Equal("user-123", principal.FindFirstValue(ClaimTypes.NameIdentifier));
        Assert.Equal("Test Teacher", principal.FindFirstValue(ClaimTypes.Name));
        Assert.Contains(principal.Claims, claim => claim.Type == ClaimTypes.Role && claim.Value == "Teacher");
        Assert.Contains(principal.Claims, claim => claim.Type == ClaimTypes.Role && claim.Value == "Coordinator");
        Assert.False(string.IsNullOrWhiteSpace(tokenResult.RefreshToken));
    }

    [Fact]
    public void CreateAccessToken_Throws_WhenSigningKeyIsTooShort()
    {
        var service = new JwtTokenService(Options.Create(new JwtOptions
        {
            Issuer = "Compensa.Identity",
            Audience = "Compensa.Api",
            SigningKey = "too-short",
            AccessTokenMinutes = 60
        }));

        var exception = Assert.Throws<InvalidOperationException>(() =>
            service.CreateAccessToken(new ApplicationUser { Id = "user-123" }, ["Teacher"]));

        Assert.Equal("JWT signing key must be configured with at least 32 characters.", exception.Message);
    }

    private static JwtTokenService CreateService()
    {
        return new JwtTokenService(Options.Create(new JwtOptions
        {
            Issuer = "Compensa.Identity",
            Audience = "Compensa.Api",
            SigningKey = SigningKey,
            AccessTokenMinutes = 60
        }));
    }

    private static ClaimsPrincipal ValidateToken(string token)
    {
        var handler = new JwtSecurityTokenHandler();
        return handler.ValidateToken(token, new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = "Compensa.Identity",
            ValidateAudience = true,
            ValidAudience = "Compensa.Api",
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(SigningKey)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1)
        }, out _);
    }
}
