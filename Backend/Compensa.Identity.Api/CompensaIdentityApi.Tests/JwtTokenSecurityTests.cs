using System.IdentityModel.Tokens.Jwt;
using CompensaIdentityApi.Infrastructure.Auth;
using CompensaIdentityApi.Models;
using Microsoft.Extensions.Options;

namespace CompensaIdentityApi.Tests;

[Trait("Category", "Integration")]
public sealed class JwtTokenSecurityTests
{
    [Fact]
    public void CreateAccessToken_UsesEnvironmentSigningKeyOverride()
    {
        const string previousKeyName = "Jwt__SigningKey";
        var previous = Environment.GetEnvironmentVariable(previousKeyName);
        Environment.SetEnvironmentVariable(previousKeyName, "environment-signing-key-with-more-than-32-chars");

        try
        {
            var service = new JwtTokenService(Options.Create(new JwtOptions
            {
                Issuer = "Compensa.Identity",
                Audience = "Compensa.Api",
                SigningKey = "too-short",
                AccessTokenMinutes = 15
            }));

            var result = service.CreateAccessToken(new ApplicationUser
            {
                Id = "user-456",
                Email = "coordinator@compensa.test",
                FullName = "Test Coordinator"
            }, ["Coordinator"]);

            var jwt = new JwtSecurityTokenHandler().ReadJwtToken(result.AccessToken);
            Assert.Equal("Compensa.Identity", jwt.Issuer);
            Assert.Contains(jwt.Audiences, audience => audience == "Compensa.Api");
            Assert.Equal("user-456", jwt.Subject);
        }
        finally
        {
            Environment.SetEnvironmentVariable(previousKeyName, previous);
        }
    }

    [Fact]
    public void CreateAccessToken_HasExpectedExpiryWindow()
    {
        var before = DateTimeOffset.UtcNow;
        var service = new JwtTokenService(Options.Create(new JwtOptions
        {
            Issuer = "Compensa.Identity",
            Audience = "Compensa.Api",
            SigningKey = "unit-test-signing-key-with-more-than-32-chars",
            AccessTokenMinutes = 30
        }));

        var result = service.CreateAccessToken(new ApplicationUser { Id = "user-789" }, ["Teacher"]);
        var after = DateTimeOffset.UtcNow;

        Assert.InRange(result.ExpiresAt, before.AddMinutes(29), after.AddMinutes(31));
        Assert.False(string.IsNullOrWhiteSpace(result.RefreshToken));
    }
}
