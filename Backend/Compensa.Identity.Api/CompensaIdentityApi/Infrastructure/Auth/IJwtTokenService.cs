using CompensaIdentityApi.Models;

namespace CompensaIdentityApi.Infrastructure.Auth;

public interface IJwtTokenService
{
    JwtTokenResult CreateAccessToken(ApplicationUser user, IReadOnlyCollection<string> roles);
}
