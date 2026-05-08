using System.Net;
using CompensaIdentityApi.Contracts;

namespace CompensaIdentityApi.Middleware;

public sealed class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (InvalidOperationException exception)
        {
            await WriteErrorAsync(context, exception, HttpStatusCode.BadRequest);
        }
        catch (Exception exception)
        {
            await WriteErrorAsync(context, exception, HttpStatusCode.InternalServerError);
        }
    }

    private async Task WriteErrorAsync(HttpContext context, Exception exception, HttpStatusCode statusCode)
    {
        _logger.LogError(exception, "Unhandled request error.");

        context.Response.StatusCode = (int)statusCode;
        context.Response.ContentType = "application/json";

        var response = ApiResponse<object>.Fail(
            statusCode == HttpStatusCode.InternalServerError
                ? "An unexpected error occurred."
                : exception.Message);

        await context.Response.WriteAsJsonAsync(response);
    }
}
