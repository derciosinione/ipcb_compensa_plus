using System.Diagnostics.Metrics;

namespace CompensaIdentityApi.Observability;

public static class CompensaIdentityMetrics
{
    public const string MeterName = "Compensa.Identity.Api.Business";

    private static readonly Meter Meter = new(MeterName);

    private static readonly Counter<long> MagicLinksRequested = Meter.CreateCounter<long>(
        "compensa_identity_magic_links_requested_total",
        unit: "{request}",
        description: "Number of magic link login requests.");

    private static readonly Counter<long> MagicLinksVerified = Meter.CreateCounter<long>(
        "compensa_identity_magic_links_verified_total",
        unit: "{attempt}",
        description: "Number of magic link verification attempts.");

    private static readonly Counter<long> RefreshTokensUsed = Meter.CreateCounter<long>(
        "compensa_identity_refresh_tokens_used_total",
        unit: "{attempt}",
        description: "Number of refresh token attempts.");

    private static readonly Counter<long> AuthSessionsIssued = Meter.CreateCounter<long>(
        "compensa_identity_auth_sessions_issued_total",
        unit: "{session}",
        description: "Number of authentication sessions issued.");

    public static void RecordMagicLinkRequested(string outcome)
    {
        MagicLinksRequested.Add(1, new KeyValuePair<string, object?>("outcome", outcome));
    }

    public static void RecordMagicLinkVerified(string outcome)
    {
        MagicLinksVerified.Add(1, new KeyValuePair<string, object?>("outcome", outcome));
    }

    public static void RecordRefreshTokenUsed(string outcome)
    {
        RefreshTokensUsed.Add(1, new KeyValuePair<string, object?>("outcome", outcome));
    }

    public static void RecordAuthSessionIssued(string grantType)
    {
        AuthSessionsIssued.Add(1, new KeyValuePair<string, object?>("grant_type", grantType));
    }
}
