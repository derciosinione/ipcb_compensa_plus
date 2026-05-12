using CompensaCoreApi.Dtos.Search;

namespace CompensaCoreApi.Services.Search;

public interface IGlobalSearchService
{
    Task<IReadOnlyCollection<GlobalSearchResultResponse>> SearchAsync(
        string query,
        string actorUserId,
        bool isCoordinator,
        bool isAdmin,
        CancellationToken cancellationToken = default);
}
