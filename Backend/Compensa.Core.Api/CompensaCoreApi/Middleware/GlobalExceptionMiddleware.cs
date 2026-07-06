using System.Net;
using CompensaCoreApi.Contracts;
using CompensaCoreApi.Exceptions;
using Microsoft.EntityFrameworkCore;

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
        catch (DbUpdateException exception)
        {
            var message = "An error occurred while saving to the database.";
            if (exception.InnerException != null)
            {
                var innerMsg = exception.InnerException.Message;
                if (innerMsg.Contains("23505") || 
                    innerMsg.Contains("unique constraint", StringComparison.OrdinalIgnoreCase) || 
                    innerMsg.Contains("duplicate key", StringComparison.OrdinalIgnoreCase))
                {
                    if (innerMsg.Contains("curricular_units") && innerMsg.Contains("abbreviation"))
                    {
                        message = "A Curricular Unit with the same abbreviation already exists for this course.";
                    }
                    else if (innerMsg.Contains("curricular_units") && innerMsg.Contains("name"))
                    {
                        message = "A Curricular Unit with the same name already exists for this course.";
                    }
                    else if (innerMsg.Contains("courses") && innerMsg.Contains("abbreviation"))
                    {
                        message = "A Course with the same abbreviation already exists.";
                    }
                    else if (innerMsg.Contains("class_groups") && (innerMsg.Contains("name") || innerMsg.Contains("key")))
                    {
                        message = "A Class Group with the same name already exists for this course and year.";
                    }
                    else if (innerMsg.Contains("classrooms") && innerMsg.Contains("name"))
                    {
                        message = "A Classroom with the same name already exists.";
                    }
                    else
                    {
                        message = $"Database constraint violation: {innerMsg}";
                    }
                }
                else
                {
                    message = innerMsg;
                }
            }
            else
            {
                message = exception.Message;
            }

            await WriteErrorAsync(context, new InvalidOperationException(message, exception), HttpStatusCode.BadRequest);
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
            ? $"An unexpected error occurred: {exception.Message}"
            : exception.Message;

        await context.Response.WriteAsJsonAsync(ApiResponse<object>.Fail(message));
    }
}
