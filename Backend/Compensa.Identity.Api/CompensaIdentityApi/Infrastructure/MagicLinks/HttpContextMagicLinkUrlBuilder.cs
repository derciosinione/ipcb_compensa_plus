using Microsoft.Extensions.Options;

namespace CompensaIdentityApi.Infrastructure.MagicLinks;

public sealed class HttpContextMagicLinkUrlBuilder : IMagicLinkUrlBuilder
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly MagicLinkOptions _options;

    public HttpContextMagicLinkUrlBuilder(
        IHttpContextAccessor httpContextAccessor,
        IOptions<MagicLinkOptions> options)
    {
        _httpContextAccessor = httpContextAccessor;
        _options = options.Value;
    }

    public string BuildVerifyUrl(string token)
    {
        var httpContext = _httpContextAccessor.HttpContext
            ?? throw new InvalidOperationException("HTTP context is not available.");

        var request = httpContext.Request;
        var path = _options.VerifyPath.TrimStart('/');
        var encodedToken = Uri.EscapeDataString(token);

        return $"{request.Scheme}://{request.Host}/{path}?token={encodedToken}";
    }
}
