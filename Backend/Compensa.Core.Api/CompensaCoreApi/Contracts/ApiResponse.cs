namespace CompensaCoreApi.Contracts;

public sealed record ApiResponse<T>(
    bool Success,
    string Message,
    T? Data = default,
    IReadOnlyDictionary<string, string[]>? Errors = null)
{
    public static ApiResponse<T> Ok(string message, T? data = default) =>
        new(true, message, data);

    public static ApiResponse<T> Fail(string message, IReadOnlyDictionary<string, string[]>? errors = null) =>
        new(false, message, default, errors);
}
