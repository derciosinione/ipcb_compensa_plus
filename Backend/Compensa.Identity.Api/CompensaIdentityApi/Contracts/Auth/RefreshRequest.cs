using System.ComponentModel.DataAnnotations;

namespace CompensaIdentityApi.Contracts.Auth;

public sealed record RefreshRequest(
    [Required] string RefreshToken);
