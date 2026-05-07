using System.Net;
using CompensaCoreApi.Contracts;
using CompensaCoreApi.Exceptions;

namespace CompensaCoreApi.Middleware;

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
        catch (NotFoundException exception)
        {
            await WriteErrorAsync(context, exception, HttpStatusCode.NotFound);
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
        if (statusCode == HttpStatusCode.InternalServerError)
            _logger.LogError(exception, "Unhandled request error.");
        else
            _logger.LogWarning(exception, "Request failed with status {StatusCode}.", (int)statusCode);

        context.Response.StatusCode = (int)statusCode;
        context.Response.ContentType = "application/json";

        var message = statusCode == HttpStatusCode.InternalServerError
            ? "An unexpected error occurred."
            : exception.Message;

        await context.Response.WriteAsJsonAsync(ApiResponse<object>.Fail(message));
    }
}
