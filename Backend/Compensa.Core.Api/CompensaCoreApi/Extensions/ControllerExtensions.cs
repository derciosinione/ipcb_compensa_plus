using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CompensaCoreApi.Extensions;

public static class ControllerExtensions
{
    public static (bool IsCoordinator, bool IsAdmin) GetEffectiveRoles(this ControllerBase controller)
    {
        bool isAdmin = controller.User.IsInRole("Admin");
        bool isCoordinator = controller.User.IsInRole("Coordinator");

        if (!controller.Request.Headers.TryGetValue("X-Active-Role", out var activeRoleValues))
        {
            return (isCoordinator, isAdmin);
        }

        var activeRole = activeRoleValues.ToString().Trim().ToLower();
        
        if (string.IsNullOrEmpty(activeRole))
        {
            return (isCoordinator, isAdmin);
        }

        return activeRole switch
        {
            "admin" => (isCoordinator, isAdmin),
            "coordinator" => (isCoordinator, false),
            "teacher" => (false, false),
            "student" => (false, false),
            _ => (isCoordinator, isAdmin)
        };
    }

    public static string GetCurrentUserId(this ControllerBase controller)
    {
        return controller.User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? controller.User.FindFirstValue("sub")
            ?? throw new InvalidOperationException("Authenticated user id was not found.");
    }

    public static string GetCurrentUserEmail(this ControllerBase controller)
    {
        return controller.User.FindFirstValue(ClaimTypes.Email)
            ?? controller.User.FindFirstValue("email")
            ?? string.Empty;
    }

    public static string GetCurrentUserName(this ControllerBase controller)
    {
        return controller.User.FindFirstValue(ClaimTypes.Name)
            ?? controller.User.FindFirstValue("name")
            ?? "Unknown User";
    }
}
