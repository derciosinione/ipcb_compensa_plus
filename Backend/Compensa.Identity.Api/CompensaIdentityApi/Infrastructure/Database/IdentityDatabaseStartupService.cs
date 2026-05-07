using CompensaIdentityApi.Data;
using CompensaIdentityApi.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace CompensaIdentityApi.Infrastructure.Database;

public sealed class IdentityDatabaseStartupService : IHostedService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly IdentitySeedOptions _options;
    private readonly ILogger<IdentityDatabaseStartupService> _logger;

    public IdentityDatabaseStartupService(
        IServiceProvider serviceProvider,
        IOptions<IdentitySeedOptions> options,
        ILogger<IdentityDatabaseStartupService> logger)
    {
        _serviceProvider = serviceProvider;
        _options = options.Value;
        _logger = logger;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        await context.Database.MigrateAsync(cancellationToken);
        await SeedRolesAsync(roleManager);
        await SeedAdminAsync(userManager);

        _logger.LogInformation("Identity database schema and seed data are ready.");
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;

    private async Task SeedRolesAsync(RoleManager<IdentityRole> roleManager)
    {
        foreach (var role in _options.Roles.Where(role => !string.IsNullOrWhiteSpace(role)).Distinct())
        {
            if (await roleManager.RoleExistsAsync(role))
                continue;

            var result = await roleManager.CreateAsync(new IdentityRole(role));
            if (!result.Succeeded)
                throw new InvalidOperationException($"Failed to seed role '{role}': {FormatErrors(result)}");
        }
    }

    private async Task SeedAdminAsync(UserManager<ApplicationUser> userManager)
    {
        if (string.IsNullOrWhiteSpace(_options.AdminEmail))
            return;

        var user = await userManager.FindByEmailAsync(_options.AdminEmail);

        if (user == null)
        {
            user = new ApplicationUser
            {
                UserName = _options.AdminEmail,
                Email = _options.AdminEmail,
                EmailConfirmed = true,
                FullName = string.IsNullOrWhiteSpace(_options.AdminFullName)
                    ? "Compensa Admin"
                    : _options.AdminFullName
            };

            var createResult = await userManager.CreateAsync(user);
            if (!createResult.Succeeded)
                throw new InvalidOperationException($"Failed to seed admin user '{_options.AdminEmail}': {FormatErrors(createResult)}");
        }

        if (!await userManager.IsInRoleAsync(user, "Admin"))
        {
            var roleResult = await userManager.AddToRoleAsync(user, "Admin");
            if (!roleResult.Succeeded)
                throw new InvalidOperationException($"Failed to assign Admin role to '{_options.AdminEmail}': {FormatErrors(roleResult)}");
        }
    }

    private static string FormatErrors(IdentityResult result)
    {
        return string.Join("; ", result.Errors.Select(error => $"{error.Code}: {error.Description}"));
    }
}
