using CompensaIdentityApi.Models;

namespace CompensaIdentityApi.Services;

public interface IMagicLinkService
{
    Task<string> GenerateMagicLinkTokenAsync(ApplicationUser user, CancellationToken cancellationToken = default);
    Task<ApplicationUser?> ValidateMagicLinkTokenAsync(string token, CancellationToken cancellationToken = default);
}
