using System.ComponentModel.DataAnnotations;

namespace CompensaIdentityApi.DTOs;

public class LoginRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;
}
