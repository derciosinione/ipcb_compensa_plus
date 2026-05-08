using CompensaCoreApi.Dtos.Courses;

namespace CompensaCoreApi.Services.Courses;

public interface ICourseService
{
    Task<IReadOnlyCollection<CourseResponse>> ListAsync(string? search, CancellationToken cancellationToken = default);
    Task<CourseResponse> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<CourseDetailsResponse> GetDetailsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<CourseResponse> CreateAsync(CreateCourseRequest request, CancellationToken cancellationToken = default);
    Task<CourseResponse> UpdateAsync(Guid id, UpdateCourseRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
