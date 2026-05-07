namespace CompensaIdentityApi.Infrastructure.Database;

public sealed class IdentitySeedOptions
{
    public const string SectionName = "IdentitySeed";

    public string[] Roles { get; init; } = ["Admin", "Coordinator", "Teacher", "Student"];
    public string? AdminEmail { get; init; }
    public string? AdminFullName { get; init; }
}
