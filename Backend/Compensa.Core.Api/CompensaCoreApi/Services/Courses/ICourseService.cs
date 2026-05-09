using CompensaCoreApi.Dtos.Courses;

namespace CompensaCoreApi.Services.Courses;

public interface ICourseService
{
    Task<IReadOnlyCollection<CourseResponse>> ListAsync(string? search, CancellationToken cancellationToken = default);
    Task<CourseResponse> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<CourseDetailsResponse> GetDetailsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<CourseResponse> CreateAsync(CreateCourseRequest request, CancellationToken cancellationToken = default);
    Task<CourseResponse> UpdateAsync(Guid id, UpdateCourseRequest request, CancellationToken cancellationToken = default);
    Task<CurricularUnitResponse> CreateUnitAsync(Guid courseId, UpsertCurricularUnitRequest request, CancellationToken cancellationToken = default);
    Task<CurricularUnitResponse> UpdateUnitAsync(Guid courseId, Guid unitId, UpsertCurricularUnitRequest request, CancellationToken cancellationToken = default);
    Task DeleteUnitAsync(Guid courseId, Guid unitId, CancellationToken cancellationToken = default);
    Task<CurricularUnitComponentResponse> CreateComponentAsync(Guid courseId, Guid unitId, UpsertCurricularUnitComponentRequest request, CancellationToken cancellationToken = default);
    Task<CurricularUnitComponentResponse> UpdateComponentAsync(Guid courseId, Guid unitId, Guid componentId, UpsertCurricularUnitComponentRequest request, CancellationToken cancellationToken = default);
    Task DeleteComponentAsync(Guid courseId, Guid unitId, Guid componentId, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
