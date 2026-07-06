using CompensaCoreApi.Dtos.Courses;

namespace CompensaCoreApi.Services.Courses;

public interface ICourseService
{
    Task<IReadOnlyCollection<CourseResponse>> ListAsync(
        string? search,
        Guid? academicYearId,
        string actorUserId,
        string actorUserEmail,
        bool isCoordinator,
        bool isAdmin,
        CancellationToken cancellationToken = default);
    Task<CourseResponse> GetByIdAsync(
        Guid id,
        Guid? academicYearId,
        string actorUserId,
        string actorUserEmail,
        bool isCoordinator,
        bool isAdmin,
        CancellationToken cancellationToken = default);
    Task<CourseDetailsResponse> GetDetailsAsync(
        Guid id,
        Guid? academicYearId,
        string actorUserId,
        string actorUserEmail,
        bool isCoordinator,
        bool isAdmin,
        CancellationToken cancellationToken = default);
    Task<CourseResponse> CreateAsync(CreateCourseRequest request, CancellationToken cancellationToken = default);
    Task<CourseResponse> UpdateAsync(Guid id, UpdateCourseRequest request, CancellationToken cancellationToken = default);
    Task<CurricularUnitResponse> CreateUnitAsync(Guid courseId, UpsertCurricularUnitRequest request, CancellationToken cancellationToken = default);
    Task<CurricularUnitResponse> UpdateUnitAsync(Guid courseId, Guid unitId, UpsertCurricularUnitRequest request, CancellationToken cancellationToken = default);
    Task DeleteUnitAsync(Guid courseId, Guid unitId, CancellationToken cancellationToken = default);
    Task<CurricularUnitComponentResponse> CreateComponentAsync(Guid courseId, Guid unitId, UpsertCurricularUnitComponentRequest request, CancellationToken cancellationToken = default);
    Task<CurricularUnitComponentResponse> UpdateComponentAsync(Guid courseId, Guid unitId, Guid componentId, UpsertCurricularUnitComponentRequest request, CancellationToken cancellationToken = default);
    Task DeleteComponentAsync(Guid courseId, Guid unitId, Guid componentId, CancellationToken cancellationToken = default);
    Task<ClassGroupResponse> CreateClassGroupAsync(Guid courseId, UpsertClassGroupRequest request, CancellationToken cancellationToken = default);
    Task<ClassGroupResponse> UpdateClassGroupAsync(Guid courseId, Guid classGroupId, UpsertClassGroupRequest request, CancellationToken cancellationToken = default);
    Task DeleteClassGroupAsync(Guid courseId, Guid classGroupId, CancellationToken cancellationToken = default);
    Task<ClassScheduleResponse> CreateScheduleAsync(Guid courseId, Guid classGroupId, UpsertClassScheduleRequest request, CancellationToken cancellationToken = default);
    Task<ClassScheduleResponse> UpdateScheduleAsync(Guid courseId, Guid classGroupId, Guid scheduleId, UpsertClassScheduleRequest request, CancellationToken cancellationToken = default);
    Task DeleteScheduleAsync(Guid courseId, Guid classGroupId, Guid scheduleId, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
