using CompensaIdentityApi.Contracts.Users;
using CompensaIdentityApi.Models;
using CompensaIdentityApi.Repositories.Users;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MassTransit;
using CompensaIdentityApi.IntegrationEvents;

namespace CompensaIdentityApi.Services.Users;

public sealed class UserService : IUserService
{
    private readonly IUserRepository _repository;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly IPublishEndpoint _publishEndpoint;

    public UserService(
        IUserRepository repository,
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        IPublishEndpoint publishEndpoint)
    {
        _repository = repository;
        _userManager = userManager;
        _roleManager = roleManager;
        _publishEndpoint = publishEndpoint;
    }

    public async Task<IReadOnlyCollection<UserResponse>> ListAsync(
        string? search,
        CancellationToken cancellationToken = default)
    {
        var users = await _repository.ListAsync(search, cancellationToken);
        var responses = new List<UserResponse>(users.Count);

        foreach (var user in users)
        {
            responses.Add(await ToResponseAsync(user));
        }

        return responses;
    }

    public async Task<IReadOnlyCollection<RoleResponse>> ListRolesAsync(CancellationToken cancellationToken = default)
    {
        return await _roleManager.Roles
            .OrderBy(role => role.Name)
            .Select(role => new RoleResponse(role.Name!))
            .ToArrayAsync(cancellationToken);
    }

    public async Task<UserResponse> CreateAsync(
        CreateUserRequest request,
        CancellationToken cancellationToken = default)
    {
        var roles = NormalizeRoles(request.Roles);
        await EnsureRolesExistAsync(roles);

        var email = request.Email.Trim();
        var existing = await _repository.GetByEmailAsync(email, cancellationToken);
        if (existing != null)
            throw new InvalidOperationException($"User '{email}' already exists.");

        var now = DateTime.UtcNow;
        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            EmailConfirmed = true,
            FullName = request.FullName.Trim(),
            CreatedAt = now,
            UpdatedAt = now
        };

        var createResult = await _userManager.CreateAsync(user);
        if (!createResult.Succeeded)
            throw new InvalidOperationException($"Failed to create user: {FormatErrors(createResult)}");

        var roleResult = await _userManager.AddToRolesAsync(user, roles);
        if (!roleResult.Succeeded)
            throw new InvalidOperationException($"Failed to assign user roles: {FormatErrors(roleResult)}");

        await _publishEndpoint.Publish(new UserRegisteredEvent
        {
            UserId = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            RegisteredAt = user.CreatedAt
        }, cancellationToken);

        return await ToResponseAsync(user);
    }

    public async Task<UserResponse> UpdateRolesAsync(
        string id,
        UpdateUserRolesRequest request,
        CancellationToken cancellationToken = default)
    {
        var user = await _repository.GetByIdAsync(id, cancellationToken)
            ?? throw new KeyNotFoundException($"User '{id}' was not found.");

        var roles = NormalizeRoles(request.Roles);
        await EnsureRolesExistAsync(roles);

        var currentRoles = await _userManager.GetRolesAsync(user);
        var removeResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);
        if (!removeResult.Succeeded)
            throw new InvalidOperationException($"Failed to remove current user roles: {FormatErrors(removeResult)}");

        var addResult = await _userManager.AddToRolesAsync(user, roles);
        if (!addResult.Succeeded)
            throw new InvalidOperationException($"Failed to assign user roles: {FormatErrors(addResult)}");

        user.UpdatedAt = DateTime.UtcNow;
        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
            throw new InvalidOperationException($"Failed to update user: {FormatErrors(updateResult)}");

        return await ToResponseAsync(user);
    }

    private async Task EnsureRolesExistAsync(IReadOnlyCollection<string> roles)
    {
        foreach (var role in roles)
        {
            if (!await _roleManager.RoleExistsAsync(role))
                throw new InvalidOperationException($"Role '{role}' does not exist.");
        }
    }

    private static string[] NormalizeRoles(IReadOnlyCollection<string> roles)
    {
        var normalizedRoles = roles
            .Where(role => !string.IsNullOrWhiteSpace(role))
            .Select(role => role.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        if (normalizedRoles.Length == 0)
            throw new InvalidOperationException("At least one role must be selected.");

        return normalizedRoles;
    }

    private async Task<UserResponse> ToResponseAsync(ApplicationUser user)
    {
        var roles = await _userManager.GetRolesAsync(user);

        return new UserResponse(
            user.Id,
            user.Email ?? string.Empty,
            user.FullName,
            roles.OrderBy(role => role).ToArray(),
            user.EmailConfirmed,
            user.CreatedAt,
            user.UpdatedAt);
    }

    private static string FormatErrors(IdentityResult result)
    {
        return string.Join("; ", result.Errors.Select(error => $"{error.Code}: {error.Description}"));
    }
}
