using CompensaIdentityApi.Contracts.Auth;
using CompensaIdentityApi.DTOs;

namespace CompensaIdentityApi.Services.Auth;

public interface IAuthService
{
    Task<LoginResponse> RequestMagicLinkAsync(
        LoginRequest request,
        CancellationToken cancellationToken = default);

    Task<VerifyMagicLinkResponse?> VerifyMagicLinkAsync(
        string token,
        CancellationToken cancellationToken = default);
}
