using CompensaIdentityApi.Models;

namespace CompensaIdentityApi.Tests;

[Trait("Category", "Unit")]
public sealed class RefreshTokenTests
{
    [Fact]
    public void IsActive_ReturnsTrue_WhenTokenIsNotExpiredOrRevoked()
    {
        var token = new RefreshToken
        {
            Token = "refresh-token",
            ExpiresAt = DateTime.UtcNow.AddMinutes(5),
            RevokedAt = null,
            UserId = "user-123"
        };

        Assert.True(token.IsActive);
    }

    [Fact]
    public void IsActive_ReturnsFalse_WhenTokenIsRevoked()
    {
        var token = new RefreshToken
        {
            Token = "refresh-token",
            ExpiresAt = DateTime.UtcNow.AddMinutes(5),
            RevokedAt = DateTime.UtcNow,
            UserId = "user-123"
        };

        Assert.False(token.IsActive);
    }

    [Fact]
    public void IsActive_ReturnsFalse_WhenTokenIsExpired()
    {
        var token = new RefreshToken
        {
            Token = "refresh-token",
            ExpiresAt = DateTime.UtcNow.AddMinutes(-5),
            RevokedAt = null,
            UserId = "user-123"
        };

        Assert.True(token.IsExpired);
        Assert.False(token.IsActive);
    }
}
