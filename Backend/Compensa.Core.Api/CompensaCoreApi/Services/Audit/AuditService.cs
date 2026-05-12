using System.Text.Json;
using CompensaCoreApi.Data;
using CompensaCoreApi.Domain.Audit;

namespace CompensaCoreApi.Services.Audit;

public interface IAuditService
{
    Task LogActionAsync(string entityName, string entityId, string action, string actorUserId, object? previousState = null, object? newState = null);
}

public sealed class AuditService : IAuditService
{
    private readonly CoreDbContext _dbContext;

    public AuditService(CoreDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task LogActionAsync(string entityName, string entityId, string action, string actorUserId, object? previousState = null, object? newState = null)
    {
        var log = new AuditLog
        {
            EntityName = entityName,
            EntityId = entityId,
            Action = action,
            ActorUserId = actorUserId,
            PreviousState = previousState != null ? JsonSerializer.Serialize(previousState) : null,
            NewState = newState != null ? JsonSerializer.Serialize(newState) : null,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.AuditLogs.Add(log);
        await _dbContext.SaveChangesAsync();
    }
}
