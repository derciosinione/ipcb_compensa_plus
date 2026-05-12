using CompensaCoreApi.Dtos.Search;

namespace CompensaCoreApi.Services.Search;

public interface IGlobalSearchService
{
    Task<IReadOnlyCollection<GlobalSearchResultResponse>> SearchAsync(
        string query,
        CancellationToken cancellationToken = default);
}
