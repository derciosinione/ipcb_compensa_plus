using System.Diagnostics;
using Serilog.Context;

namespace Compensa.Gateway.Middleware;

public class StructuredLoggingMiddleware(RequestDelegate next, ILogger<StructuredLoggingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var sw = Stopwatch.StartNew();
        var traceId = Activity.Current?.TraceId.ToString() ?? context.TraceIdentifier;
        var correlationId = context.Request.Headers["X-Correlation-ID"].FirstOrDefault() ?? Guid.NewGuid().ToString();
        
        context.Response.Headers.TryAdd("X-Correlation-ID", correlationId);

        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            LogRequest(context, sw.ElapsedMilliseconds, traceId, correlationId, ex);
            throw;
        }

        LogRequest(context, sw.ElapsedMilliseconds, traceId, correlationId);
    }

    private void LogRequest(HttpContext context, long durationMs, string traceId, string correlationId, Exception? ex = null)
    {
        var level = ex != null ? "ERROR" : "INFO";
        var userId = context.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development";

        using (LogContext.PushProperty("timestamp", DateTime.UtcNow.ToString("O")))
        using (LogContext.PushProperty("level", level))
        using (LogContext.PushProperty("service", "api-gateway"))
        using (LogContext.PushProperty("environment", environment))
        using (LogContext.PushProperty("event", ex != null ? "gateway.request.failed" : "gateway.request.processed"))
        using (LogContext.PushProperty("traceId", traceId))
        using (LogContext.PushProperty("spanId", Activity.Current?.SpanId.ToString()))
        using (LogContext.PushProperty("correlationId", correlationId))
        using (LogContext.PushProperty("request", new { method = context.Request.Method, path = context.Request.Path.Value }, true))
        using (LogContext.PushProperty("user", userId != null ? new { id = userId } : null, true))
        using (LogContext.PushProperty("response", new { statusCode = context.Response.StatusCode, durationMs = durationMs }, true))
        {
            if (ex != null)
            {
                using (LogContext.PushProperty("error", new { type = ex.GetType().Name, message = ex.Message, code = "INTERNAL_ERROR" }, true))
                {
                    logger.LogError("Request failed: {Message}", ex.Message);
                }
            }
            else
            {
                logger.LogInformation("Request processed");
            }
        }
    }
}
