namespace CompensaCoreApi.Dtos.Search;

public sealed record GlobalSearchResultResponse(
    string Id,
    string Type,
    string Title,
    string Subtitle,
    string Path);
